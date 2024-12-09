const { fetchDB } = require('../models/dbaccess');
const { checkJerseyNumber } = require('../models/checkJerseyNumber')
exports.addEmployee = async (req, res) => {
    const {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        role,
        joined_at,
        email,
        image,
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
    if(!image) image = 'default-avatar.png'
    try {
        const query = `
            INSERT INTO person
                (first_name, last_name, birth_date, nationality, person_role, joined_at, email, picture, contract_due) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING ID
            `
        const values = [firstName, lastName, dateOfBirth, nationality, role, joined_at, email, image, contractUntil]
        const result = await fetchDB(query, values)
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
            const playerValues = [result.rows[0].id, playerNumber, position];

            await fetchDB(playerQuery, playerValues);
        }
        if (role === 'coach') {
            const coachQuery = `
                INSERT INTO coach (person_id, role)
                VALUES ($1, $2)
            `;
            const coachValues = [result.rows[0].id, coachRole];

            await fetchDB(coachQuery, coachValues);
        }
    } catch (error) {
        console.error("Error adding employee:", error);
        res.status(500).json({ message: "Failed to add employee.", error: error.message });
    }
}
exports.deleteEmployee = async (req, res) => {
    const { employeeId } = req.params;
    try {
        const roleQuery = `SELECT person_role FROM person WHERE id = $1`;
        const roleResult = await fetchDB(roleQuery, [employeeId]);
        if (roleResult.rowCount === 0) {
            return res.status(404).json({ message: "Employee not found." });
        }
        const { person_role } = roleResult.rows[0];
        if (person_role === 'coach') {
            const deleteCoachQuery = `DELETE FROM coaches WHERE person_id = $1`;
            await fetchDB(deleteCoachQuery, [employeeId]);
        } else if (person_role === 'player') {
            const playerIdQuery = `SELECT player_id FROM players WHERE person_id = $1`;
            const playerIdResult = await fetchDB(playerIdQuery, [employeeId]);
            if (playerIdResult.rowCount > 0) {
                const playerId = playerIdResult.rows[0].player_id;
                const deletePlayerInjuryQuery = `DELETE FROM player_injury WHERE player_id = $1`;
                await fetchDB(deletePlayerInjuryQuery, [playerId]);
                const deletePlayerStatsQuery = `DELETE FROM player_stats WHERE player_id = $1`;
                await fetchDB(deletePlayerStatsQuery, [playerId]);
                const deletePlayerQuery = `DELETE FROM players WHERE id = $1`;
                await fetchDB(deletePlayerQuery, [playerId]);
            }
        }
        const deletePersonQuery = `DELETE FROM person WHERE id = $1`;
        const result = await fetchDB(deletePersonQuery, [employeeId]);
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
        const result = await fetchDB(query);
        res.status(200).json(result.rows);
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
        const result = await fetchDB(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching employees:", error);
        res.status(500).json({ message: "Failed to retrieve employees.", error: error.message });
    }
}