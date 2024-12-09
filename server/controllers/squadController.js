const { fetchDB } = require('../models/dbaccess'); // Импортируйте вашу функцию для работы с БД
const { createStartingSquad } = require('../models/chooseOptimalSquad/chooseSquad2'); // Импортируйте функцию для создания стартового состава
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
exports.getSquad = async (req, res) => {
    try {
        const squad = await createStartingSquad();
        const uniqueIds = new Set();

        // Проходим по значениям объекта
        for (const value of Object.values(squad)) {
            if (Array.isArray(value)) {
                // Если значение - массив, добавляем все его элементы
                value.forEach(id => uniqueIds.add(id));
            } else {
                // Если значение - одиночное число, добавляем его
                uniqueIds.add(value);
            }
        }

        // Преобразуем Set обратно в массив, если это необходимо
        const uniqueIdsArray = Array.from(uniqueIds);

        const idPositionArray = [];
        // Создаем idPositionArray из объекта squad
        for (const position in squad) {
            const id = squad[position];
            if (Array.isArray(id)) {
                id.forEach(playerId => {
                    idPositionArray.push({ id: playerId, squadPosition: position });
                });
            } else {
                idPositionArray.push({ id: id, squadPosition: position });
            }
        }

        // SQL-запрос для получения данных игроков
        const query = `
            SELECT 
                person.id AS person_id,
                person.first_name,
                person.last_name,
                players.player_id,
                players.position,
                players.jersey_number,
                players.detailed_positions,
                players.is_injured
            FROM 
                person 
            INNER JOIN 
                players ON person.id = players.person_id
        `;
        const players = await fetchDB(query);

        // Создаем карту для быстрого доступа к полным именам и номерам футболок по их ID
        const playerMap = {};
        players.rows.forEach(player => {
            const fullName = `${player.first_name} ${player.last_name}`;
            playerMap[player.player_id] = {
                fullName: fullName,
                jersey_number: player.jersey_number,
                detailed_positions: player.detailed_positions,
                is_injured: player.is_injured
            };
        });

        // Теперь заменяем ID в idPositionArray на полные имена и номера футболок
        const finalSquad = idPositionArray.map(item => ({
            id: item.id,
            squadPosition: item.squadPosition,
            fullName: playerMap[item.id]?.fullName || null,
            jersey_number: playerMap[item.id]?.jersey_number || null,
            detailed_positions: playerMap[item.id]?.detailed_positions || null,
            is_injured: playerMap[item.id]?.is_injured
        }));

        const bench = players.rows.filter(player => !uniqueIdsArray.includes(player.player_id));
        const transformedArray = bench.map(player => ({
            id: player.player_id,
            fullName: `${player.first_name} ${player.last_name}`,
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
        res.status(500).json({ error: "An error occurred while creating the squad." });
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