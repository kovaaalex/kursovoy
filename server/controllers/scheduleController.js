const { fetchDB } = require('../models/dbaccess');

exports.getSchedule = async (req, res) => {
    try {
        const query = `SELECT 
                tournament_name,
                season,
                tour,
                homeclub.team_name as hometeam,
                homeclub.logo as homelogo,
                score_home,
                score_away,
                awayclub.team_name as awayteam,
                awayclub.logo as awaylogo,
                date,
                homeclub.stadium
            FROM football_match 
            INNER JOIN tournament 
            ON football_match.idt = tournament.idt
            INNER JOIN clubs AS homeclub
            ON football_match.hometeam = homeclub.id
            INNER JOIN clubs AS awayclub
            ON football_match.awayteam = awayclub.id
            ORDER BY date `
        const result = await fetchDB(query)
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Не найдены матчи' });
        }
        res.json(result.rows)
    } catch (error) {
        console.error('Ошибка при получении данных', error.message)
        res.status(500).json({message: 'Ошибка сервера', error: error.message})
    }
};

exports.addMatch = async (req, res) => {
    const { home_team_id, away_team_id, date, time, stadium } = req.body;

    if (!home_team_id || !away_team_id || !date || !time || !stadium) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }

    try {
        const query = `
            INSERT INTO match (home_team_id, away_team_id, date, time, stadium)
            VALUES ($1, $2, $3, $4, $5) RETURNING id
        `;
        const values = [home_team_id, away_team_id, date, time, stadium];
        const result = await fetchDB(query, values);

        res.status(201).json({ message: 'Матч добавлен успешно', matchId: result.rows[0].id });
    } catch (error) {
        console.error('Ошибка при добавлении матча:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.updateMatch = async (req, res) => {
    const { id } = req.params;
    const { home_team_id, away_team_id, date, time, stadium } = req.body;

    const updates = [];
    const values = [];
    let index = 1;

    if (home_team_id) {
        updates.push(`home_team_id = $${index++}`);
        values.push(home_team_id);
    }
    if (away_team_id) {
        updates.push(`away_team_id = $${index++}`);
        values.push(away_team_id);
    }
    if (date) {
        updates.push(`date = $${index++}`);
        values.push(date);
    }
    if (time) {
        updates.push(`time = $${index++}`);
        values.push(time);
    }
    if (stadium) {
        updates.push(`stadium = $${index++}`);
        values.push(stadium);
    }

    values.push(id); // Добавляем ID матча в конец массива

    if (updates.length === 0) {
        return res.status(400).json({ message: 'Необходимо указать хотя бы одно поле для обновления' });
    }

    try {
        const query = `UPDATE match SET ${updates.join(', ')} WHERE id = $${index}`;
        const result = await fetchDB(query, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Матч не найден' });
        }

        res.status(200).json({ message: 'Информация о матче обновлена успешно' });
    } catch (error) {
        console.error('Ошибка при обновлении информации о матче:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.deleteMatch = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM match WHERE id = $1`;
        const result = await fetchDB(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Матч не найден' });
        }

        res.status(200).json({ message: 'Матч удален успешно' });
    } catch (error) {
        console.error('Ошибка при удалении матча:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};