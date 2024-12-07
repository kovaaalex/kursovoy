const bcrypt = require('bcrypt');
const { fetchPersons } = require('../model/dbaccess');
const { generatePassword } = require('../model/generators/generatePassword');
(async function () {
    const myQuery = "SELECT * FROM person";
    const result = await fetchPersons(myQuery);
    const persons = result.rows;
    for (const person of persons) {
        const personId = person.id;
        const plainPassword = generatePassword();
        const insertQuery = 'INSERT INTO person2 (id, password) VALUES ($1, $2)';
        await fetchPersons(insertQuery, [personId, plainPassword]);
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const updateQuery = 'UPDATE person SET password = $1 WHERE id = $2';
        await fetchPersons(updateQuery, [hashedPassword, personId]);
    }
})();
