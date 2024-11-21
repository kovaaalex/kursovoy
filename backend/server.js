const bcrypt = require('bcrypt');
const express = require('express')
const cors = require('cors');
const {fetchPersons} = require ('./dbaccess');
const { authenticateUser } = require('./authentication')
const { generateCode } = require('./generateMailCode')
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kovalenko.alex04@gmail.com',
        pass: 'rksf osyy klrh ergj'
    }
})
const app = express()
app.use(cors())
app.use(express.json())
app.get('/api/players', async (req, res) => {
    try {
        const query = `
            SELECT 
                person.id,
                person.first_name,
                person.last_name,
                players.position AS role,
                person.picture,
				players.jersey_number,
                person.nationality
            FROM person
            INNER JOIN players ON person.id = players.person_id
            WHERE person.picture IS NOT NULL
            
            UNION ALL
            
            SELECT 
                person.id,
                person.first_name,
                person.last_name,
                coaches.role,
                person.picture,
				NULL,
                person.nationality
            FROM person
            INNER JOIN coaches ON person.id = coaches.person_id
            WHERE person.picture IS NOT NULL
            ORDER BY jersey_number
        `;
        const result = await fetchPersons(query);

        // Проверка, вернул ли запрос какие-либо строки
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ни игроки, ни тренеры не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message)
        res.status(500).json({ message: 'Ошибка сервера', error: error.message })
    }
})
app.get('/api/coaches', async (req, res) => {
    try {
        const query = `
            SELECT 
                person.id,
                person.first_name,
                person.last_name,
                coaches.role
            FROM person
            INNER JOIN coaches ON person.id = coaches.person_id
        `;
        const result = await fetchPersons(query)
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ни игроки, ни тренеры не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message)
        res.status(500).json({ message: 'Ошибка сервера', error: error.message })
    }
})
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await authenticateUser(email, password)    
        res.json({ message: 'Успешный вход', user })
    } catch (error) {
        alert(error.message)
    }
})
app.post('/api/register', async (req, res) => {
    const { first_name, last_name, email, password, birth_date } = req.body;

    // Проверка обязательных полей
    if (!email || !password || !first_name) {
        return res.status(400).json({ message: 'Email, password, and first name are required' });
    }

    // Проверка на существующего пользователя
    const existingUserQuery = 'SELECT * FROM person WHERE email = $1';
    const existingUser = await fetchPersons(existingUserQuery, [email]);
    if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    try {
        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Вставка нового пользователя в таблицу person
        const query = `
            INSERT INTO person (first_name, last_name, email, password, birth_date, person_role) 
            VALUES ($1, $2, $3, $4, $5, 'fan') RETURNING id
        `;
        const values = [first_name, last_name, email, hashedPassword, birth_date];
        const result = await fetchPersons(query, values);
        
        const newUserId = result.rows[0].id; // Получаем ID нового пользователя

        // Вставка в таблицу fans
        const insertFansQuery = 'INSERT INTO fans (person_id) VALUES ($1)';
        await fetchPersons(insertFansQuery, [newUserId]);

        // Успешный ответ
        res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    } catch (error) {
        console.error('Ошибка при регистрации:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});
app.post('/api/forgot', async (req, res) => {
    const { email } = req.body
    const code = generateCode()
    console.log(code)
    console.log(email)
    const mailOptions = {
        from: 'kovaaalex@gmail.com',
        to: email,
        subject: 'Forgot Password',
        text: `Your 6-digit code is: ${code}`
    }
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Письмо отправлено', code });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).send({ message: 'Ошибка при отправке письма', error: error.toString() });
    }
})
app.put('/api/newpassword', async(req, res) => {
    const {email, password} = req.body
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const query = `UPDATE person SET password = $1 WHERE email = $2 RETURNING *`
        const values = [hashedPassword, email]
        const result = await fetchPersons(query, values)
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' })
        }
        const userId = userResult.rows[0].id
        const insertQuery = `INSERT INTO person2 (id, password) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET password = $2`
        const insertValues = [userId, hashedPassword]
        await fetchPersons(insertQuery, insertValues)
        return res.status(200).json({ message: 'Password updated successfully' })
    } catch (error) {
        console.error('Error updating password:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
})
app.get('/api/schedule', async(req, res) => {
    try {
        const query = `SELECT 
	tournament_name,
	season,
	tour,
	homeclub.team_name as hometeam,
	homeclub.logo as homelogo,
	score_home,
	score_away,
	awayclub.team_name as awayteam,
	awayclub.logo as awaylogo,
	date,
	homeclub.stadium
FROM football_match 
INNER JOIN tournament 
ON football_match.idt = tournament.idt
INNER JOIN clubs AS homeclub
ON football_match.hometeam = homeclub.id
INNER JOIN clubs AS awayclub
ON football_match.awayteam = awayclub.id
ORDER BY date `
        const result = await fetchPersons(query)
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Не найдены матчи' });
        }
        res.json(result.rows)
    } catch (error) {
        console.error('Ошибка при получении данных', error.message)
        res.status(500).json({message: 'Ошибка сервера', error: error.message})
    }
})
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000')
})
