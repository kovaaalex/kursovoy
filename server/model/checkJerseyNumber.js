const { fetchPersons } = require ('./dbaccess');
async function checkJerseyNumber(numb) {
    const myQuery = 'SELECT DISTINCT jersey_number FROM players';
    const result = await fetchPersons(myQuery);
    const jerseyNumbers = result.rows.map(row => row.jersey_number);
    return jerseyNumbers.includes(numb) ? true : false;
}
module.exports = {checkJerseyNumber}