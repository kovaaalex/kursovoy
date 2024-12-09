const { fetchDB } = require('../models/dbaccess');
exports.getInjuriesList = async (req, res) => {
    try {
        const query = `
            SELECT * FROM injuries
        `;
        const result = await fetchDB(query);
        console.log(result)
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Травмы не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных о травмах:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}
exports.getInjuries = async (req, res) => {
    try {
        const query = `
            SELECT
                person.first_name || ' ' || person.last_name AS name,
                injuries.injury_name,
                player_injury.injury_id,
                players.player_id,
                injury_date,
                return_date 
            FROM player_injury 
            INNER JOIN players 
            ON players.player_id = player_injury.player_id 
            INNER JOIN person 
            ON players.person_id = person.id
            INNER JOIN injuries
            ON injuries.injury_id = player_injury.injury_id
        `;
        const result = await fetchDB(query);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Травмы не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных о травмах:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.addInjury = async (req, res) => {
    const { injury_id, player_id, start_date, end_date } = req.body;

    if (!player_id || !injury_id || !start_date || !end_date) {
        return res.status(400).json({ message: 'Игрок и травма обязательны' });
    }

    try {
        const query = `INSERT INTO player_injury (injury_id, player_id, injury_date, return_date) VALUES($1, $2, $3, $4)`;
        const values = [injury_id, player_id, start_date, end_date];
        await fetchDB(query, values);
        return res.status(201).json({ message: 'Данные о травме добавлены успешно' });
    } catch (error) {
        console.error('Ошибка при добавлении данных о травме:', error);
        res.status(500).send({ message: 'Ошибка сервера', error: error.toString() });
    }
};

exports.updateInjury = async (req, res) => {
    console.log(req.params)
    const { id } = req.params;
    const { is_injured } = req.body;

    try {
        const query = `UPDATE players SET is_injured = $1 WHERE player_id = $2`;
        const result = await fetchDB(query, [is_injured, id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Травма не найдена' });
        }

        res.status(200).json({ message: 'Информация о травме обновлена успешно' });
    } catch (error) {
        console.error('Ошибка при обновлении информации о травме:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.deleteInjury = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM player_injury WHERE id = $1`;
        const result = await fetchDB(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Травма не найдена' });
        }

        res.status(200).json({ message: 'Травма удалена успешно' });
    } catch (error) {
        console.error('Ошибка при удалении травмы:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
exports.getInjuryByID = async (req, res) => {
    const {id} = req.params
    console.log(id)
    try {
        const query = `
            SELECT
                person.first_name || ' ' || person.last_name AS name,
                injuries.injury_name,
                player_injury.injury_id,
                players.player_id,
                injury_date,
                return_date,
                person.id AS person_id
            FROM player_injury 
            INNER JOIN players 
            ON players.player_id = player_injury.player_id 
            INNER JOIN person 
            ON players.person_id = person.id
            INNER JOIN injuries
            ON injuries.injury_id = player_injury.injury_id
            WHERE person_id = $1
        `;
        const result = await fetchDB(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'У этого игрока не было травм' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных о травмах:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};