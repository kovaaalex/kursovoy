const bcrypt = require('bcrypt')
const { fetchDB } = require('./dbaccess')
async function findUserByEmail(email) {
    const query = 'SELECT * FROM person WHERE email = $1'
    const values = [email]
    const result = await fetchDB(query, values)
    return result.rows[0]
}
async function authenticateUser(email, password) {
    const user = await findUserByEmail(email, password)
    if(!user) {
        throw new Error('Неверный логин или пароль')
    }
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
        throw new Error('Неверный логин или пароль')
    }
    return user
}
module.exports = { authenticateUser }
