const {fetchDB} = require ('./dbaccess')
const fs = require('fs').promises;
(async function() {
    const url = 'public/data/users.json'
    const myQuery = 'SELECT * FROM person'
    const result = await fetchDB(myQuery)
    const persons = result.rows
    await fs.writeFile(url, JSON.stringify(persons, null, 2))
})()