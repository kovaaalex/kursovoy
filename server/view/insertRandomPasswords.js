const { fetchPersons } = require ('../model/dbaccess');
const { generatePassword } = require('../model/generators/generatePassword');
(async function() {
    const myQuery = 'SELECT * FROM person'
    const result = await fetchPersons(myQuery)
    const persons = result.rows
    for (const person of persons) {
        if(!person.password){
            const newPassword = generatePassword()
            const newQuery = 'UPDATE person SET password = $1 WHERE last_name = $2'
            await fetchPersons(newQuery, [newPassword, person.last_name])
        }
        else console.log('Пароль уже существует')
    }
})()