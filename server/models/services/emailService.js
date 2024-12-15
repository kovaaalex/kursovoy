const nodemailer = require('nodemailer');
const { generateCode } = require('../generators/generateMailCode')
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject) => {
    const code = generateCode(); // Generate the code
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: 'kovalenko.alex04@gmail.com',
        subject,
        text: `Your 6-digit code: ${code}`
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, code };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.toString() };
    }
};

module.exports = { sendEmail };