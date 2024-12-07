const express = require('express');
const router = express.Router();
const { fetchPersons } = require('../model/dbaccess');

// Получение всех запросов (без фильтрации)
exports.contractRequests =  async (req, res) => {
    try {
        const result = await fetchPersons(`SELECT
            person.id,
            cr.contract_id,
            person.first_name || ' ' || person.last_name AS name, 
            cr.new_contract_due,
            cr.new_salary,
            cr.request_date,
            cr.can_update
        FROM contract_request AS cr 
        INNER JOIN person ON person.id = cr.person_id`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Не удалось получить запросы' });
    }
}

// Получение запросов по идентификатору
exports.contractRequestsById = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await fetchPersons(`SELECT
                person.id,
                cr.contract_id,
                person.first_name || ' ' || person.last_name AS name, 
                cr.new_contract_due,
                cr.new_salary,
                cr.request_date,
                cr.can_update
            FROM contract_request AS cr 
            INNER JOIN person ON person.id = cr.person_id WHERE person.id = $1`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Запрос не найден' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Не удалось получить запрос' });
    }
}

// Создание нового запроса на контракт
exports.putContractRequests = async (req, res) => {
    const { person_id, newContractDue, newSalary } = req.body;
    console.log(person_id)
    try {
        const result = await fetchPersons(
            'INSERT INTO contract_request (person_id, new_contract_due, new_salary, request_date) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [person_id, newContractDue, +newSalary]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Не удалось создать запрос' });
    }
}
exports.putContractById = async (req, res) => {
    const { id } = req.params;
    const { is_updated } = req.body;

    try {
        console.log(id, is_updated, req.params)
        const query = `UPDATE contract_request SET can_update = $1 WHERE contract_id = $2`;
        const values = [is_updated, id];
        const result = await fetchPersons(query, values); // Предполагается, что fetchPersons - это ваша функция для выполнения запроса

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Контракт не найден' });
        }

        // Возвращаем успешный ответ без result.rows[0], так как это UPDATE
        return res.status(200).json({ message: 'Контракт успешно обновлен' });
    } catch (error) {
        console.error('Ошибка при обновлении контракта:', error);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
};
