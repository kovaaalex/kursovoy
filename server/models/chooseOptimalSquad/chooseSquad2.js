const { read } = require('fs');
const { fetchDB } = require('../dbaccess');
const { findMaxRatingsByPosition } = require('./graph');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});
const requiredPositions = {
    "Left Winger": 1,
    "Centreback": 2,
    "Right Winger": 1,
    "Central Defensive Midfielder": 2,
    "Central Attacking Midfielder": 1,
    "Goalkeeper": 1,
    "Leftback": 1,
    "Rightback": 1
};
async function fetchPlayers() {
    try {
        const result = await pool.query(`
            SELECT 
				person.id, position, person_id, birth_date, jersey_number, goals_scored, assists, goals_conceded, 	
				clean_sheets, count__matches, transfercost, players.player_id, height, weight, 
				is_injured, detailed_positions, pace, crossing, shooting, finishing, shot_accuracy, passing, creativity, teamwork, dribbling, strength, tackling, interceptions,
				blocked_shots, forward_heading, stamina
            FROM players 
            LEFT JOIN player_stats ON players.player_id = player_stats.player_id 
            INNER JOIN person ON person.id = players.person_id
        `);
        return result.rows;
    } catch (error) {
        console.error("Error fetching players:", error);
        return [];
    }
}

async function filterNotInjuredPlayers() {
    const players = await fetchPlayers();
    return players.filter(player => !player.is_injured);
}

function chooseBestGoalkeeper(goalkeepers) {
    goalkeepers.sort((a, b) => calculateGoalkeeperRating(b) - calculateGoalkeeperRating(a));
    return goalkeepers[0];
}

function chooseBestForward(forwards) {
    forwards.sort((a, b) => calculateForwardRating(b) - calculateForwardRating(a));
    return forwards[0];
}

function calculateGoalkeeperRating(goalkeeper) {
    let rating = 0;
    rating += goalkeeper.count__matches * 10;
    rating += goalkeeper.clean_sheets * 20;
    rating += (100 - goalkeeper.goals_conceded) * 5;
    const age = new Date().getFullYear() - new Date(goalkeeper.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += goalkeeper.height * 0.5 + goalkeeper.weight * 0.2;
    const joinedAt = new Date(goalkeeper.joined_at);
    const monthsDifference = ((new Date().getFullYear() * 12 + new Date().getMonth()) - 
                               (joinedAt.getFullYear() * 12 + joinedAt.getMonth()));
    rating += (12 - monthsDifference) * 5;
    return rating;
}

function calculateCenterBackRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 3;
    rating += player.height * 0.5 + player.weight * 0.1;
    rating += player.tackling * 3 + player.interceptions * 3 + player.blocked_shots * 2;
    return rating;
}

function calculateFullBackRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.1;
    rating += player.tackling * 2 + player.interceptions * 2 + player.blocked_shots;
    rating += player.crossing * 3 + player.dribbling + player.pace + player.assists;
    return rating;
}

function calculateMidfielderRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.2;
    rating += player.passing * 2 + player.creativity * 1.5 + player.teamwork * 1.5;
    return rating;
}

function calculateWingerRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.1;
    rating += player.pace * 1.5 + player.dribbling * 2 + player.crossing * 1.5;
    rating += player.finishing + player.goals_scored * 0.2 + player.assists * 0.3;
    return rating;
}

function calculateForwardRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.2;
    rating += player.shooting * 2 + player.finishing * 2 + player.shot_accuracy * 2;
    rating += player.goals_scored * 0.3;
    return rating;
}

async function createStartingSquad() {
    const startSquad = {
        "Goalkeeper": null,
        "Leftback": null,
        "Centreback": [],
        "Rightback": null,
        "Central Defensive Midfielder": [],
        "Central Attacking Midfielder": null,
        "Left Winger": null,
        "Right Winger": null,
        "Centreforward": null
    };

    let readyPlayers = await filterNotInjuredPlayers();
    if (readyPlayers.length < 11) {
        return { error: "Недостаточно футболистов для формирования состава." }; // Передаем сообщение об ошибке
    }
    const noGk = readyPlayers.filter(pl => pl.position !== 'Goalkeeper')
    if (noGk.length < 10) {
        return { error: "Недостаточно полевых футболистов для формирования состава." }; // Передаем сообщение об ошибке
    }
    let playerRatings = readyPlayers.map(player => {
        let ratings = [];
        for (const position of player.detailed_positions) {
            let rating = 0;
            switch (position) {
                case 'Centreback':
                    rating = calculateCenterBackRating(player);
                    break;
                case 'Leftback':
                case 'Rightback':
                    rating = calculateFullBackRating(player);
                    break;
                case 'Central Attacking Midfielder':
                case 'Central Defensive Midfielder':
                case 'Central Midfielder':
                    rating = calculateMidfielderRating(player);
                    break;
                case 'Left Winger':
                case 'Right Winger':
                    rating = calculateWingerRating(player);
                    break;
                case 'Centreforward':
                    rating = calculateForwardRating(player);
                    break;
                default:
                    break;
            }
            ratings.push(rating);
        }

        return {
            player_id: player.player_id,
            name: `${player.first_name} ${player.last_name}`,
            detailed_positions: player.detailed_positions,
            ratings: ratings
        };
    });

    const goalkeepers = readyPlayers.filter(player => player.position === "Goalkeeper");
    console.log(goalkeepers)
    let startGoalkeeper = chooseBestGoalkeeper(goalkeepers);
    if (!startGoalkeeper) {
        console.log("Нет киперов, выбираем самого высокого игрока.");
        startGoalkeeper = readyPlayers.sort((a , b) => a.height - b.height)[readyPlayers.length - 1]
        startSquad["Goalkeeper"] = startGoalkeeper.player_id;
        readyPlayers = readyPlayers.filter(player => player.player_id !== startGoalkeeper.player_id);
    } else {
        startSquad["Goalkeeper"] = startGoalkeeper.player_id;
        readyPlayers = readyPlayers.filter(player => player.player_id !== startGoalkeeper.player_id);
    }
    requiredPositions["Goalkeeper"] = 0
    console.log(requiredPositions)
    playerRatings = playerRatings.filter(player => player.player_id !== startGoalkeeper.player_id)
    console.log(playerRatings)
    const defenders = playerRatings.filter(player =>
        player.detailed_positions.some(position => ['Centreback', 'Leftback', 'Rightback'].includes(position))
    );
    
    const ratings = {};
    defenders.forEach(player => {
        player.detailed_positions.forEach((position, index) => {
            if (!ratings[player.player_id]) {
                ratings[player.player_id] = {};
            }
            ratings[player.player_id][position] = player.ratings[index];
        });
    });
    
    const defenseRatings = {};
    for (let playerId in ratings) {
        defenseRatings[playerId] = {
            Leftback: ratings[playerId].Leftback || ratings[playerId].Rightback * 0.9 || ratings[playerId].Centreback * 0.6,
            Centreback1: ratings[playerId].Centreback || ratings[playerId].Rightback * 0.6 || ratings[playerId].Leftback * 0.6,
            Centreback2: ratings[playerId].Centreback || ratings[playerId].Rightback * 0.6 || ratings[playerId].Leftback * 0.6,
            Rightback: ratings[playerId].Rightback || ratings[playerId].Leftback * 0.9 || ratings[playerId].Centreback * 0.6
        };
    }
    let lessDefense = 0
    if(defenders.length < 4) {
        console.log('Defenders less than 4')
        lessDefense = 4 - defenders.length    
        console.log(ratings)
        let defIds = Object.keys(defenseRatings).map(obj => +obj)
        console.log(defIds)
        console.log(defenseRatings)
        readyPlayers = readyPlayers.filter(player => !defIds.includes(player.player_id))
        let tempRatings = {};

        // Проходим по каждому игроку в readyPlayers
        readyPlayers.forEach(player => {
            // Рассчитываем рейтинги для Leftback и Rightback
            const fullBackRating = calculateFullBackRating(player);
            const centerBackRating = calculateCenterBackRating(player);

            // Сохраняем рейтинги в объекте ratings
            if (!tempRatings[player.player_id]) {
                tempRatings[player.player_id] = {};
            }
            
            tempRatings[player.player_id]['Leftback'] = fullBackRating;
            tempRatings[player.player_id]['Rightback'] = fullBackRating;
            tempRatings[player.player_id]['Centreback1'] = centerBackRating;
            tempRatings[player.player_id]['Centreback2'] = centerBackRating;
        });
        console.log(tempRatings)

        // Предполагаем, что tempRatings уже содержит необходимые данные
        let bestCentrebacks = Object.entries(tempRatings)
        .sort(([, a], [, b]) => b.Centreback1 - a.Centreback1) // Сортируем по Centreback1 в порядке убывания
        .slice(0, lessDefense) // Выбираем топ-5 лучших (или любое другое количество)
        .map(([key, value]) => ({
            player_id: key,
            Centreback1: value.Centreback1,
            Leftback: value.Leftback,
            Rightback: value.Rightback,
            Centreback2: value.Centreback2
        }));

        console.log(bestCentrebacks);
        bestCentrebacks.forEach(player => {
            defenseRatings[player.player_id] = {
            Leftback: player.Leftback,
            Centreback1: player.Centreback1,
            Centreback2: player.Centreback2,
            Rightback: player.Rightback
            };
        });
        console.log(defenseRatings)
        const excludedPlayerIds = bestCentrebacks.map(player => +player.player_id);
    }
    console.log(readyPlayers)
    const defense = findMaxRatingsByPosition(defenseRatings);
    const playersToRemove = new Set(Object.values(defense).map(el => +el.player));
    playerRatings = playerRatings.filter(player => !playersToRemove.has(player.player_id));
    readyPlayers = readyPlayers.filter(player => !playersToRemove.has(player.player_id));
    startSquad["Leftback"] = +defense.Leftback.player;
    startSquad["Rightback"] = +defense.Rightback.player;
    startSquad["Centreback"].push(+defense.Centreback1.player, +defense.Centreback2.player);
    // тут все ок

    const strikers = playerRatings.filter(player => player.detailed_positions.includes("Centreforward"));
    let startStriker
    if(!strikers.length) {
        let alternatives = {}
        readyPlayers.forEach(player => {
            const strikerRating = calculateForwardRating(player);
            alternatives[player.player_id] = strikerRating;
        });
    
        // Находим игрока с наивысшим рейтингом
        startStriker = Object.entries(alternatives).reduce((best, current) => {
            return current[1] > best[1] ? current : best;
        }, [null, -Infinity])
        startSquad["Centreforward"] = +startStriker[0];
    }
    else { 
        startStriker = chooseBestForward(strikers); 
        startSquad["Centreforward"] = startStriker.player_id;
    }
    readyPlayers = readyPlayers.filter(player => player.player_id !== +startStriker[0])
    playerRatings = playerRatings.filter(player => player.player_id !== +startStriker[0]);
    const wingers = playerRatings.filter(player =>
        player.detailed_positions.some(position => ['Left Winger', 'Right Winger'].includes(position))
    );
    let wwing = {}
    if(wingers.length < 2) {
        let needed = 2 - wingers.length
        let alternatives = []
        const playerIdsAsNumbers = wingers.map(player => Number(player.player_id))
        readyPlayers = readyPlayers.filter(player => !playerIdsAsNumbers.includes(player.player_id));
        playerRatings = playerRatings.filter(player => !playerIdsAsNumbers.includes(player.player_id));
        readyPlayers.forEach(player => {
            const wingerRating = calculateWingerRating(player);
            alternatives[player.player_id] = wingerRating;
        });
        const bestAlternatives = Object.entries(alternatives)
        .sort(([, a], [, b]) => b - a) // Сортируем по убыванию рейтинга
        .slice(0, needed) // Берем столько, сколько нужно
        .map(([key]) => key); // Получаем только ID

    // Добавляем лучших альтернативных вингеров в состав
        bestAlternatives.forEach(playerId => {
            if (wingers.length < 2) {
                const pl = readyPlayers.find(player => player.player_id === +playerId)
                const pll = playerRatings.find(player => player.player_id === pl.player_id)
                pll.detailed_positions.push('Left Winger', 'Right Winger')
                pll.ratings.push(calculateWingerRating(pl), calculateWingerRating(pl))
                wingers.push(pll);
            }
        });
    }
    let tempwingerratings = {}
    wingers.forEach(winger => {
        winger.detailed_positions.forEach((position, index) => {
            if (!tempwingerratings[winger.player_id]) {
                tempwingerratings[winger.player_id] = {};
            }
            tempwingerratings[winger.player_id][position] = winger.ratings[index];
        });
    });

    const wingerRatings = {};
    for (let playerId in tempwingerratings) {
        wingerRatings[playerId] = {
            'Left Winger': tempwingerratings[playerId]['Left Winger'] || tempwingerratings[playerId]['Right Winger'] * 0.8,
            'Right Winger': tempwingerratings[playerId]['Right Winger'] || tempwingerratings[playerId]['Left Winger'] * 0.9
        };
    }

    const wingersMax = findMaxRatingsByPosition(wingerRatings, ['Left Winger', 'Right Winger']);
    startSquad["Left Winger"] = +wingersMax['Left Winger'].player;
    startSquad["Right Winger"] = +wingersMax['Right Winger'].player;

    const wingersToRemove = new Set(Object.values(wingersMax).map(el => +el.player));
    playerRatings = playerRatings.filter(player => !wingersToRemove.has(player.player_id));
    readyPlayers = readyPlayers.filter(player => !wingersToRemove.has(player.player_id))
    const midfielders = playerRatings.filter(player =>
        player.detailed_positions.some(position => 
          ['Central Attacking Midfielder', 'Central Defensive Midfielder'].includes(position)
        )
    );
    if(midfielders.length < 3) {
        let lessMid = 3 - midfielders.length
        let alternatives = []
        
        const midIds = midfielders.map(mid => +mid.player_id);
        readyPlayers = readyPlayers.filter(pl => !midIds.includes(pl.player_id))
        playerRatings = playerRatings.filter(pl => !midIds.includes(pl.player_id))
        readyPlayers.forEach(player => {
            const midfielderRating = calculateMidfielderRating(player);
            alternatives[player.player_id] = midfielderRating;
        });
            const bestAlternatives = Object.entries(alternatives)
            .sort(([, a], [, b]) => b - a) // Сортируем по убыванию рейтинга
            .slice(0, lessMid) // Берем столько, сколько нужно
            .map(([key]) => key); // Получаем только ID
    
        // Добавляем лучших альтернативных вингеров в состав
            bestAlternatives.forEach(playerId => {
                if (midfielders.length < 3) {
                    const pl = readyPlayers.find(player => player.player_id === +playerId)
                    const pll = playerRatings.find(player => player.player_id === pl.player_id)
                    pll.detailed_positions.push('Central Attacking Midfielder', 'Central Defensive Midfielder')
                    pll.ratings.push(calculateMidfielderRating(pl), calculateMidfielderRating(pl))
                    midfielders.push(pll);
                }
            });
        }
    midfielders.forEach(mid => {
        mid.detailed_positions.forEach((position, index) => {
            if (!ratings[mid.player_id]) {
                ratings[mid.player_id] = {};
            }
            ratings[mid.player_id][position] = mid.ratings[index];
        });
    });

    const midfielderRatings = {};
    for (let playerId in ratings) {
        midfielderRatings[playerId] = {
            'Central Attacking Midfielder': ratings[playerId]['Central Attacking Midfielder'] || ratings[playerId]['Central Defensive Midfielder'] * 0.6,
            'Central Defensive Midfielder1': ratings[playerId]['Central Defensive Midfielder'] || ratings[playerId]['Central Attacking Midfielder'] * 0.6,
            'Central Defensive Midfielder2': ratings[playerId]['Central Defensive Midfielder'] || ratings[playerId]['Central Attacking Midfielder'] * 0.6
        };
    }

    const cm = findMaxRatingsByPosition(midfielderRatings, ['Central Attacking Midfielder', 'Central Defensive Midfielder1', 'Central Defensive Midfielder2']);
    startSquad["Central Attacking Midfielder"] = +cm["Central Attacking Midfielder"].player;
    startSquad["Central Defensive Midfielder"].push(+cm['Central Defensive Midfielder1'].player, +cm['Central Defensive Midfielder2'].player);

    return startSquad;
}

// Uncomment to run the function
// createStartingSquad().then(squad => console.log(squad)).catch(err => console.error(err));

module.exports = { createStartingSquad };