const { fetchPersons } = require('../model/dbaccess');
exports.getInjuriesList = async (req, res) => {
    try {
        const query = `
            SELECT * FROM injuries
        `;
        const result = await fetchPersons(query);
        
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
        const result = await fetchPersons(query);
        
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
        const query = `INSERT INTO player_injury (injury_id, player_id, start_date, end_date) VALUES($1, $2, $3, $4)`;
        const values = [injury_id, player_id, start_date, end_date];
        await fetchPersons(query, values);
        return res.status(201).json({ message: 'Данные о травме добавлены успешно' });
    } catch (error) {
        console.error('Ошибка при добавлении данных о травме:', error);
        res.status(500).send({ message: 'Ошибка сервера', error: error.toString() });
    }
};

exports.updateInjury = async (req, res) => {
    const { id } = req.params;
    const { injury_id, start_date, end_date } = req.body;

    if (!injury_id && !start_date && !end_date) {
        return res.status(400).json({ message: 'Необходимо указать хотя бы одно поле для обновления' });
    }

    const updates = [];
    const values = [];
    let index = 1;

    if (injury_id) {
        updates.push(`injury_id = $${index++}`);
        values.push(injury_id);
    }
    if (start_date) {
        updates.push(`start_date = $${index++}`);
        values.push(start_date);
    }
    if (end_date) {
        updates.push(`end_date = $${index++}`);
        values.push(end_date);
    }

    values.push(id); // Добавляем ID травмы в конец массива

    try {
        const query = `UPDATE player_injury SET ${updates.join(', ')} WHERE id = $${index}`;
        const result = await fetchPersons(query, values);
        
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
        const result = await fetchPersons(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Травма не найдена' });
        }

        res.status(200).json({ message: 'Травма удалена успешно' });
    } catch (error) {
        console.error('Ошибка при удалении травмы:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};