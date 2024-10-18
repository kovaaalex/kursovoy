const {connectDB, fetchPersons, disconnectDB} = require ('./dbaccess')
const fs = require('fs').promises;
(async function() {
    const url = 'public/data/users.json'
    await connectDB()
    const myQuery = 'SELECT * FROM person'
    const result = await fetchPersons(myQuery)
    const persons = result.rows
    await fs.writeFile(url, JSON.stringify(persons, null, 2))
    await disconnectDB()
})()