const bcrypt = require('bcrypt');
const { authenticateUser } = require('../model/authentication');
const { generateToken } = require('../model/generators/generateToken');
const nodemailer = require('nodemailer');
const { fetchPersons } = require('../model/dbaccess')
const { generateCode } = require('../model/generators/generateMailCode')


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kovalenko.alex04@gmail.com',
        pass: 'rksf osyy klrh ergj'
    }
});

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await authenticateUser(email, password);
        const token = generateToken(user)
        console.log(token)
        res.json({ message: 'Успешный вход', user, token });
    } catch (error) {
        console.error('Ошибка аутентификации:', error.message);
        res.status(401).json({ message: 'Неверный email или пароль' });
    }
};

exports.register = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password ) {
        return res.status(400).json({ message: 'Email, password обязательны' });
    }

    // Проверка существующего пользователя
    const existingUserQuery = 'SELECT * FROM person WHERE email = $1';
    const existingUser = await fetchPersons(existingUserQuery, [email]);
    const token = generateToken(user)

    // Если пользователь не существует, возвращаем ошибку
    if (existingUser.rows.length === 0) {
        return res.status(400).json({ message: 'Пользователь с таким email не существует' });
    }

    try {
        const userId = existingUser.rows[0].id
        if (existingUser.rows[0].password) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }
        else {
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const updatePasswordQuery = 'UPDATE person SET password = $1 WHERE email = $2';
                const updatePasswordQuery2 = 'UPDATE person2 SET password = $1 WHERE id = $2';
                await fetchPersons(updatePasswordQuery, [hashedPassword, email]);
                await fetchPersons(updatePasswordQuery2, [password, userId]);
                
            }
            return res.status(200).json({ message: 'Пароль обновлен', user: existingUser, token });
        }
    } catch (error) {
        console.error('Ошибка при регистрации:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const code = generateCode();
    const mailOptions = {
        from: 'kovaaalex@gmail.com',
        to: email,
        subject: 'Forgot Password',
        text: `Ваш 6-значный код: ${code}`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Письмо отправлено', code });
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).send({ message: 'Ошибка при отправке письма', error: error.toString() });
    }
};
exports.protectedRoute = (req, res) => {
    const token = req.headers['authorization']; // Исправлено: 'authorization'
    if (!token) {
        return res.status(401).json({ message: "Токен недействителен" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Токен недействителен или истек' });
        }
        // Токен действителен, продолжайте с декодированными данными
        res.json({ message: 'Доступ разрешен', user: decoded });
    });
};
exports.updatePassword = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email и пароль обязательны' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `UPDATE person SET password = $1 WHERE email = $2 RETURNING *`;
        const values = [hashedPassword, email];
        const result = await fetchPersons(query, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        
        const token = generateToken(result.rows[0]);
        const userId = result.rows[0].id;
        console.log(userId);
        
        // Обновление пароля в другой таблице (если нужно)
        const updateQuery = `UPDATE person2 SET password = $1 WHERE id = $2`;
        const updateValues = [hashedPassword, userId];
        await fetchPersons(updateQuery, updateValues);
        
        return res.status(200).json({ message: 'Пароль успешно обновлен', user: result.rows[0], token });
    } catch (error) {
        console.error('Ошибка при обновлении пароля:', error);
        return res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
};