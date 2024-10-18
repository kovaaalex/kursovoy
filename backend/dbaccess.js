const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'fcb',
    password: 'root',
    port: 5432
})
async function connectDB() {
    try {
        await client.connect()
        console.log('success')
    } catch (error) {
        console.error(error.message)
    }
}
async function disconnectDB() {
    try {
        await client.end()
    } catch(error) {
        console.error(error.message)
    }
}
async function fetchPersons(myQuery, params = []) {
    try {
        const res = await client.query(myQuery, params)
        return res
    } catch (error) {
        console.error(error.message)
    }
}
module.exports = {
    client,
    connectDB,
    fetchPersons,
    disconnectDB
}