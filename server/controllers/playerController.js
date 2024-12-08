const { fetchPersons } = require('../model/dbaccess');

exports.getPlayers = async (req, res) => {
    try {
        const query = `SELECT * FROM players INNER JOIN person ON person.id = players.person_id ORDER BY jersey_number`;
        const result = await fetchPersons(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Ни игроки, ни тренеры не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.getCurrentPlayers = async (req, res) => {
    try {
        const query = `
            SELECT 
                players.player_id AS player_id,
                person.first_name || ' ' || person.last_name AS name,
                players.jersey_number, 
                players.is_injured 
            FROM person 
            INNER JOIN players ON players.person_id = person.id 
            ORDER BY jersey_number
        `;
        const result = await fetchPersons(query);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Игроки не найдены' });
        }
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.updatePlayerPermission = async (req, res) => {
    const { id } = req.params;
    const player_id = +id;
    const { is_injured } = req.body;
    
    if (player_id === null || is_injured === null) {
        return res.status(400).json({ message: 'ID игрока и статус травмы обязательны' });
    }

    try {
        const query = `UPDATE players SET is_injured = $1 WHERE player_id = $2`;
        const result = await fetchPersons(query, [is_injured, player_id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Игрок не найден' });
        }
        res.status(200).json({ message: 'Статус игрока обновлен успешно', is_injured });
    } catch (error) {
        console.error('Ошибка при обновлении статуса игрока:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.addPlayerInjury = async (req, res) => {
    const { injury_id, player_id, start_date, end_date } = req.body;

    if (!player_id || !injury_id || !start_date || !end_date) {
        return res.status(400).json({ message: 'Игрок и травма обязательны' });
    }

    try {
        const query = `INSERT INTO player_injury VALUES($1, $2, $3, $4)`;
        const values = [injury_id, player_id, start_date, end_date];
        await fetchPersons(query, values);
        return res.status(201).json({ message: 'Данные о травме добавлены успешно' });
    } catch (error) {
        console.error('Ошибка при добавлении данных о травме:', error);
        res.status(500).send({ message: 'Ошибка сервера', error: error.toString() });
    }
};
exports.getPlayerStats = async(req, res) => {
    try {
        const query = `SELECT * 
            FROM player_stats 
            INNER JOIN players 
            ON players.player_id = player_stats.player_id
            INNER JOIN person ON players.person_id = person.id`
        const result = await fetchPersons(query)
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Статистики игроков не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}
exports.getNewPlayersWithoutStats = async(req, res) => {
    try {
        const query = `SELECT 
            player_id,
            first_name || ' ' || last_name AS name 
        FROM players 
        INNER JOIN person ON person.id = players.person_id 
        WHERE player_id 
        NOT IN (
            SELECT player_id 
            FROM player_stats
        ) AND 
        position !='Goalkeeper'`
        const result = await fetchPersons(query)
        res.json(result.rows);
    } catch (error) {
        
        console.error('Ошибка при получении данных:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}
exports.postPlayerStats = async (req, res) => {
    const { player_id } = req.params; // Fetch player_id from URL parameters
    const {
        positions,
        pace,
        crossing,
        shooting,
        finishing,
        shot_accuracy,
        passing,
        teamwork,
        creativity,
        dribbling,
        strength,
        tackling,
        interceptions,
        blocked_shots,
        forward_heading,
        stamina,
    } = req.body; // Destructure all stats from the request body
    console.log(positions)
    try {
        // Update the player's detailed positions
        const updateQuery = 'UPDATE players SET detailed_positions = $1 WHERE player_id = $2';
        await fetchPersons(updateQuery, [JSON.stringify(positions), player_id]);

        // Insert the player's stats
        const insertQuery = `
            INSERT INTO player_stats (player_id, pace, crossing, shooting, finishing, shot_accuracy, 
            passing, teamwork, creativity, dribbling, strength, tackling, interceptions, blocked_shots, 
            forward_heading, stamina) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        `;
        await fetchPersons(insertQuery, [
            player_id,
            pace,
            crossing,
            shooting,
            finishing,
            shot_accuracy,
            passing,
            teamwork,
            creativity,
            dribbling,
            strength,
            tackling,
            interceptions,
            blocked_shots,
            forward_heading,
            stamina,
        ]);

        // Commit the transaction
        res.status(200).json({ message: 'Статистика игрока успешно обновлена.' });
    } catch (error) {
        // Rollback the transaction in case of an error
        console.error('Ошибка при обновлении статистики игрока:', error);
        res.status(500).json({ error: 'Ошибка при обновлении статистики игрока: ' + error.message });
    }
};