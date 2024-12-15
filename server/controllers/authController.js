const bcrypt = require('bcrypt');
const { authenticateUser } = require('../models/authentication');
const { generateToken } = require('../models/generators/generateToken');
const nodemailer = require('nodemailer');
const { fetchDB } = require('../models/dbaccess');
const { generateCode } = require('../models/generators/generateMailCode');
const { sendEmail } = require('../models/services/emailService')
exports.login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await authenticateUser(email, password);
        const token = generateToken(user);
        const sendCode = await sendEmail(email, 'Login Notification', 'You have successfully logged in.');
        console.log('Email sent:', sendCode);
        res.json({
            success: false,
            message: 'Login successful, but code is required',
            user,
            token,
            code: sendCode.code
        });
    } catch (error) {
        console.error('Authentication error:', error.message);
        res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
    }
};
exports.register = async (req, res) => {
    const { email, password } = req.body;
    
    // Проверка на наличие email и password
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const existingUserQuery = 'SELECT * FROM person WHERE email = $1';
    const existingUser = await fetchDB(existingUserQuery, [email]);

    // Проверка, существует ли пользователь
    if (existingUser.rows.length === 0) {
        return res.status(400).json({ message: 'User with this email does not exist' });
    }

    try {
        const userId = existingUser.rows[0].id;
        
        // Проверка, заполнен ли пароль
        if (existingUser.rows[0].password) {
            return res.status(400).json({ message: 'User with this email already exists with a password.' });
        } else {
            // Хеширование нового пароля
            const hashedPassword = await bcrypt.hash(password, 10);
            const updatePasswordQuery = 'UPDATE person SET password = $1 WHERE email = $2 RETURNING *';
            const updatedUser = await fetchDB(updatePasswordQuery, [hashedPassword, email]);
            const token = generateToken(updatedUser.rows[0]);

            // Отправка уведомления на почту
            const sentCode = await sendEmail(email, 'Password Updated', 'Your password has been successfully updated.');
            console.log('Email sent:', sentCode);

            // Ответ клиенту
            return res.json({
                success: true,
                message: 'Password updated successfully.',
                user: updatedUser.rows[0],
                token,
                code: sentCode.code
            });
        }
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const code = generateCode();
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: 'kovalenko.alex04@gmail.com',
        subject: 'Forgot Password',
        text: `Your 6-digit code: ${code}`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Email sent', code });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).send({ message: 'Error sending email', error: error.toString() });
    }
};

exports.protectedRoute = (req, res) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: "Token is invalid" });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is invalid or expired' });
        }
        res.json({ message: 'Access granted', user: decoded });
    });
};

exports.updatePassword = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `UPDATE person SET password = $1 WHERE email = $2 RETURNING *`;
        const values = [hashedPassword, email];
        const result = await fetchDB(query, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const token = generateToken(result.rows[0]);
        const userId = result.rows[0].id;
        console.log(userId);
        
        const updateQuery = `UPDATE person2 SET password = $1 WHERE id = $2`;
        const updateValues = [hashedPassword, userId];
        await fetchDB(updateQuery, updateValues);
        
        return res.status(200).json({ message: 'Password successfully updated', user: result.rows[0], token });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};