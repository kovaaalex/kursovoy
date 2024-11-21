const { Pool } = require('pg')
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'fcb',
    password: 'root',
    port: 5432
})
async function fetchPersons(myQuery, params = []) {
    try {
        const res = await pool.query(myQuery, params)
        return res
    } catch (error) {
        console.error(error.message)
    }
}
module.exports = {
    pool,
    fetchPersons
}