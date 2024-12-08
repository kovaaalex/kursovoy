const { fetchPersons } = require('../model/dbaccess');
const { checkJerseyNumber } = require('../model/checkJerseyNumber')
exports.addEmployee = async (req, res) => {
    const {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        role,
        email,
        contractUntil,
        playerNumber,
        position,
        positions,
        coachRole,
    } = req.body;
    if (!firstName || !lastName || !email || !role) {
        return res.status(400).json({ message: "Please fill in all required fields." });
    }
    console.log(firstName, lastName)
    try {
        const query = `
            INSERT INTO person
                (first_name, last_name, birth_date, nationality, person_role, email, contract_due) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ID
            `
        const values = [firstName, lastName, dateOfBirth, nationality, role, email, contractUntil]
        const result = await fetchPersons(query, values)
        console.log(result.rows[0])
        if (role === 'player') {
            const isNumberUsed = await checkJerseyNumber(playerNumber)
            
            if (isNumberUsed) {
                return res.status(400).json({ message: "This jersey number is already in use." });
            }
            console.log(result.rows[0].id, playerNumber, position)
            const playerQuery = `
                INSERT INTO players (person_id, jersey_number, position)
                VALUES ($1, $2, $3)
            `;
            const playerValues = [result.rows[0].id, playerNumber, position]; // Use the returned ID

            await fetchPersons(playerQuery, playerValues);
        }
        if (role === 'coach') {
            const coachQuery = `
                INSERT INTO coach (person_id, role)
                VALUES ($1, $2)
            `;
            const coachValues = [result.rows[0].id, coachRole]; // Use the returned ID

            await fetchPersons(coachQuery, coachValues);
        }
    } catch (error) {
        console.error("Error adding employee:", error);
        res.status(500).json({ message: "Failed to add employee.", error: error.message });
    }
}
exports.deleteEmployee = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const query = `DELETE FROM person WHERE id = $1`;
        const result = await fetchPersons(query, [employeeId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Employee not found." });
        }
        res.status(200).json({ message: "Employee deleted successfully." });
    } catch (error) {
        console.error("Error deleting employee:", error);
        res.status(500).json({ message: "Failed to delete employee.", error: error.message });
    }
};
exports.getEmployees = async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                person_role, 
                first_name || ' ' || last_name AS name
            FROM person`;

        const result = await fetchPersons(query); // Предполагается, что fetchPersons выполняет запрос к базе данных

        res.status(200).json(result.rows); // Отправляем результаты запроса
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Failed to retrieve employees.", error: error.message });
    }
};
exports.getOtherEmployees = async(req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                person_role, 
                first_name || ' ' || last_name AS name
            FROM person WHERE person_role != 'player' ORDER BY person_role, id`;
        const result = await fetchPersons(query); // Предполагается, что fetchPersons выполняет запрос к базе данных
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Failed to retrieve employees.", error: error.message });
    }
}