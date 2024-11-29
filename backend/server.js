const bcrypt = require('bcrypt');
const express = require('express')
const cors = require('cors');
const {fetchPersons} = require ('./dbaccess');
const { authenticateUser } = require('./authentication')
const { generateCode } = require('./generateMailCode')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { generateToken } = require('./generateToken')
const { createStartingSquad } = require('./chooseOptimalSquad/chooseSquad2');
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
app.get('/api/currentplayers', async(req, res) => {
    try {
        const query = `SELECT 
	players.player_id AS player_id,
	person.first_name || ' ' || person.last_name AS name,
	players.jersey_number, 
	players.is_injured 
FROM person 
INNER JOIN players 
ON players.person_id = person.id 
ORDER BY jersey_number`
        const result = await fetchPersons(query);
        // Проверка, вернул ли запрос какие-либо строки
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Игроки не найдены' });
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
    const { email, password } = req.body;
    try {
        const user = await authenticateUser(email, password);
        
        const token = generateToken(user)
        console.log(token)
        // Generate JWT token including user email

        // Return user data and token
        res.json({ message: 'Успешный вход', user, token });
    } catch (error) {
        console.error('Ошибка аутентификации:', error.message);
        res.status(401).json({ message: 'Неверный email или пароль' });
    }
});
app.get('/api/injuries', async (req, res) => {
    try {
        const query = `SELECT * FROM injuries`
        const result = await fetchPersons(query)
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Травмы не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка аутентификации:', error.message);
        res.status(401).json({ message: 'Error' });
    }
})
app.get('/api/protected', (req, res) => {
    const token = req.headers['authorisation']
    if(!token) {
        return res.status(401).json({message: "Токен недейтсвителен"})
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Токен недействителен или истек' });
        }
        // Токен действителен, продолжайте с декодированными данными
        res.json({ message: 'Доступ разрешен', user: decoded });
    });
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
        const insertUsersQuery = 'INSERT INTO users (person_id) VALUES ($1)';
        await fetchPersons(insertUsersQuery, [newUserId]);
        const insertPerson2 = 'INSERT INTO person2 (id, password) VALUES ($1, $2)';
        await fetchPersons(insertPerson2, [newUserId, password]);

        // Успешный ответ
        res.status(201).json({ user: { id: newUserId, first_name, last_name, email } });
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
app.post('/api/player_injury', async(req, res) => {
    const { injury_id, player_id, start_date, end_date} = req.body
    if (!player_id || !injury_id || !start_date || !end_date) {
        return res.status(400).json({ message: 'Player and injury are required' });
    }
    try {
        console
        const query = `INSERT INTO player_injury VALUES($1, $2, $3, $4)`
        const values = [injury_id, player_id, start_date, end_date]
        await fetchPersons(query, values)
        return res.status(201).json({ message: 'Injury data added successfully' })
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
        const token = generateToken(result.rows[0])
        const userId = result.rows[0].id
        console.log(userId)
        const updateQuery = `UPDATE person2 SET password = $1 WHERE id = $2`
        const updateValues = [password, userId]
        await fetchPersons(updateQuery, updateValues)
        return res.status(200).json({ message: 'Password updated successfully', user: result.rows[0], token })
    } catch (error) {
        console.error('Error updating password:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
})
app.put('/api/updatePlayerPermission/:id', async(req, res) => {
    const {id} = req.params
    console.log(id)
    const player_id = +id
    const {is_injured} = req.body
    if (!player_id || is_injured === null) {
        return res.status(400).json({ message: 'Email and password are required' })
    }
    console.log(player_id, typeof player_id)
    const query = `UPDATE players SET is_injured = $1 WHERE player_id=$2`
    try {
        const result = await fetchPersons(query, [is_injured, player_id])
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Player not found' });
        }
        res.status(200).json({ message: 'Player permission updated successfully', is_injured })
    } catch (error) {
        console.error('Error updating player permission:', error);
        res.status(500).json({ message: 'Server error' })
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
app.get('/api/squad', async (req, res) => {
    try {
        const squad = await createStartingSquad();
        const uniqueIds = new Set();

// Проходим по значениям объекта
for (const value of Object.values(squad)) {
  if (Array.isArray(value)) {
    // Если значение - массив, добавляем все его элементы
    value.forEach(id => uniqueIds.add(id));
  } else {
    // Если значение - одиночное число, добавляем его
    uniqueIds.add(value);
  }
}

// Преобразуем Set обратно в массив, если это необходимо
const uniqueIdsArray = Array.from(uniqueIds);

console.log(uniqueIdsArray); // Выводим уникальные ID
        const idPositionArray = [];
        // Create the idPositionArray from the squad object
        for (const position in squad) {
            const id = squad[position];
            
            // Check if the value is an array (for centrebacks and defense midfielders)
            if (Array.isArray(id)) {
                id.forEach(playerId => {
                    idPositionArray.push({ id: playerId, squadPosition: position });
                });
            } else {
                // Push the single id with its position
                idPositionArray.push({ id: id, squadPosition: position });
            }
        }


        // SQL query to fetch player details
        const query = `
            SELECT 
                person.id AS person_id,
                person.first_name,
                person.last_name,
                players.player_id,
                players.position,
                players.jersey_number,
                players.detailed_positions,
                players.is_injured
            FROM 
                person 
            INNER JOIN 
                players ON person.id = players.person_id
        `;
        const players = await fetchPersons(query);

        // Create a map to quickly access player full names and jersey numbers by their IDs
        const playerMap = {};
        players.rows.forEach(player => {
            const fullName = `${player.first_name} ${player.last_name}`;
            playerMap[player.player_id] = {
                fullName: fullName,
                jersey_number: player.jersey_number, // Store the jersey number
                detailed_positions: player.detailed_positions,
                is_injured: player.is_injured
            };
        });

        // Now, replace the IDs in idPositionArray with full names and jersey numbers
        const finalSquad = idPositionArray.map(item => ({
            id: item.id,
            squadPosition: item.squadPosition,
            fullName: playerMap[item.id]?.fullName || null, // Use the map to get the full name
            jersey_number: playerMap[item.id]?.jersey_number || null, // Use the map to get the jersey number
            detailed_positions: playerMap[item.id]?.detailed_positions || null,
            is_injured: playerMap[item.id]?.is_injured
        }));
        const bench = players.rows.filter(player => !uniqueIdsArray.includes(player.player_id))
        const transformedArray = bench.map(player => ({
            id: player.player_id,
            fullName: `${player.first_name} ${player.last_name}`,
            jersey_number: player.jersey_number,
            squadPosition: "", // Assign an empty string or a relevant value if known
            detailed_positions: player.detailed_positions,
            is_injured: player.is_injured
        }));
        console.log(finalSquad)
        console.log('This is bench', transformedArray)
        res.json([finalSquad, transformedArray]); // Return the final squad array
    } catch (error) {
        console.error('Error creating squad', error);
        res.status(500).json({ error: "An error occurred while creating the squad." });
    }
});
app.listen(5000, () => {
    console.log('Server is running on http://localhost:5000')
})
