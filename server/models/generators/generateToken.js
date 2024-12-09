const jwt = require('jsonwebtoken');
require('dotenv').config();
function generateToken(userData){
    const JWT_SECRET = 'your_generated_secret_here'; // Replace with your actual secret

    // User data to encode in the token

    // Generate the token
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '10m' });
    return token
}
module.exports = {generateToken};