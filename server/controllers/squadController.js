const { fetchDB } = require('../models/dbaccess'); // Импортируйте вашу функцию для работы с БД
const { createStartingSquad } = require('../models/chooseOptimalSquad/chooseSquad2'); // Импортируйте функцию для создания стартового состава
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
exports.getSquad = async (req, res) => {
    try {
        const squad = await createStartingSquad();
        if (squad.error) {
            return res.status(400).json({ error: squad.error }); // Возвращаем сообщение об ошибке
        }
        const result = Object.entries(squad).flatMap(([position, id]) => {
            if (Array.isArray(id)) {
                return id.map(playerId => ({ id: playerId, position }));
            } else {
                return { id, position };
            }
        });

        console.log(result);

        // SQL-запрос для получения данных игроков
        const query = `
            SELECT 
                person.id AS person_id,
                person.first_name || ' ' || person.last_name AS name,
                players.player_id,
                players.jersey_number,
                players.detailed_positions,
                players.is_injured
            FROM 
                person 
            INNER JOIN 
                players ON person.id = players.person_id
        `;
        const players = await fetchDB(query);
        console.log(players.rows);

        // Создаем карту для быстрого доступа к полным именам и номерам футболок по их ID
        const playerMap = {};
        players.rows.forEach(player => {
            playerMap[player.player_id] = {
                fullName: player.name,
                jersey_number: player.jersey_number,
                detailed_positions: player.detailed_positions,
                is_injured: player.is_injured
            };
        });

        // Создаем финальный состав с id, позицией и дополнительными полями
        const finalSquad = result.map(item => ({
            id: item.id,
            position: item.position,
            name: playerMap[item.id]?.fullName || null,
            jersey_number: playerMap[item.id]?.jersey_number || null,
            detailed_positions: playerMap[item.id]?.detailed_positions || null
        }));

        // Получение скамейки запасных
        const bench = players.rows.filter(player => !result.map(item => item.id).includes(player.player_id));
        const transformedArray = bench.map(player => ({
            id: player.player_id,
            name: player.name,
            jersey_number: player.jersey_number,
            squadPosition: "", // Присваиваем пустую строку или соответствующее значение, если известно
            detailed_positions: player.detailed_positions,
            is_injured: player.is_injured
        }));

        console.log(finalSquad);
        console.log('This is bench', transformedArray);
        res.json([finalSquad, transformedArray]); // Возвращаем финальный массив состава
    } catch (error) {
        console.error('Error creating squad', error);
        res.status(500).json({ error });
    }
};

exports.saveSquad = async (req, res) => {
    const { squad, bench } = req.body;

    // Создание нового рабочего листа для состава
    const squadWs = XLSX.utils.json_to_sheet(squad);
    const benchWs = XLSX.utils.json_to_sheet(bench);

    // Создание новой книги и добавление листов
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, squadWs, 'Squad');
    XLSX.utils.book_append_sheet(wb, benchWs, 'Bench');

    // Запись файла в память
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Установите заголовки для скачивания файла
    res.setHeader('Content-Disposition', 'attachment; filename=squad.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
};