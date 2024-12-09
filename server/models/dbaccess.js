require('dotenv').config();
const { Pool } = require('pg')
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
})
async function fetchDB(myQuery, params = []) {
    try {
        const res = await pool.query(myQuery, params)
        return res
    } catch (error) {
        console.error(error.message)
    }
}
module.exports = {
    pool,
    fetchDB
}