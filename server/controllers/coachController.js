const { fetchPersons } = require('../model/dbaccess');

exports.getCoaches = async (req, res) => {
    try {
        const query = `
            SELECT 
                person.id,
                person.first_name,
                person.last_name,
                coaches.role
            FROM person
            INNER JOIN coaches ON person.id = coaches.person_id
        `;
        const result = await fetchPersons(query);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Тренеры не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};
exports.getCoachesById = async (req, res) => {
    const {id} = req.params
    try {
        const query = `
            SELECT 
                person.id,
                person.first_name,
                person.last_name,
                coaches.role
            FROM person
            INNER JOIN coaches ON person.id = coaches.person_id WHERE person.id = $1
        `;
        const result = await fetchPersons(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Тренеры не найдены' });
        }

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении данных:', error.message);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};
exports.addCoach = async (req, res) => {
    const { first_name, last_name, role } = req.body;

    if (!first_name || !last_name || !role) {
        return res.status(400).json({ message: 'Имя, фамилия и роль обязательны' });
    }

    try {
        const query = `
            INSERT INTO coaches (first_name, last_name, role)
            VALUES ($1, $2, $3) RETURNING person_id
        `;
        const values = [first_name, last_name, role];
        const result = await fetchPersons(query, values);

        res.status(201).json({ message: 'Тренер добавлен успешно', coachId: result.rows[0].person_id });
    } catch (error) {
        console.error('Ошибка при добавлении тренера:', error);
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
};

exports.updateCoach = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, role } = req.body;

    if (!first_name && !last_name && !role) {
        return res.status(400).json({ message: 'Необходимо указать хотя бы одно поле для обновления' });
    }

    const updates = [];
    const values = [];
    let index = 1;

    if (first_name) {
        updates.push(`first_name = $${index++}`);
        values.push(first_name);
    }
    if (last_name) {
        updates.push(`last_name = $${index++}`);
        values.push(last_name);
    }
    if (role) {
        updates.push(`role = $${index++}`);
        values.push(role);
    }

    values.push(id); // Добавляем ID тренера в конец массива

    try {
        const query = `UPDATE coaches SET ${updates.join(', ')} WHERE person_id = $${index}`;
        const result = await fetchPersons(query, values);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Тренер не найден' });
        }

        res.status(200).json({ message: 'Информация о тренере обновлена успешно' });
    } catch (error) {
        console.error('Ошибка при обновлении информации о тренере:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

exports.deleteCoach = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `DELETE FROM coaches WHERE person_id = $1`;
        const result = await fetchPersons(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Тренер не найден' });
        }

        res.status(200).json({ message: 'Тренер удален успешно' });
    } catch (error) {
        console.error('Ошибка при удалении тренера:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};