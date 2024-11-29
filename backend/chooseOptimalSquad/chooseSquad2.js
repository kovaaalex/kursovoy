const { fetchPersons } = require('../dbaccess');
const { findMaxRatingsByPosition } = require('./graph');

async function fetchPlayers() {
    try {
        const result = await fetchPersons('SELECT * FROM players LEFT JOIN player_stats ON players.player_id = player_stats.player_id INNER JOIN person ON person.id = players.person_id');
        return result.rows;
    } catch (error) {
        console.error(error);
    }
}

async function filterNotInjuredPlayers() {
    const players = await fetchPlayers();
    return players.filter(player => player.is_injured === false);
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
    const currentDate = new Date();
    const monthsDifference = (currentDate.getFullYear() * 12 + currentDate.getMonth()) - (joinedAt.getFullYear() * 12 + joinedAt.getMonth());
    rating += (12 - monthsDifference) * 5;
    return rating;
}

function calculateCenterBackRating(player) {
    let rating = 0
    rating += player.count__matches * 0.5
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear()
    rating += (40 - age) * 3
    rating += player.height * 0.5
    rating += player.weight * 0.1
    rating += player.tackling * 3
    rating += player.interceptions * 3
    rating += player.blocked_shots * 2
    return rating
    }
    
    function calculateFullBackRating(player) {
    let rating = 0
    rating += player.count__matches * 0.5
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear()
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.1
    rating += player.tackling * 2
    rating += player.interceptions * 2
    rating += player.blocked_shots
    rating += player.crossing * 3
    rating += player.dribbling
    rating += player.pace
    rating += player.assists
    return rating
    }
    
    function calculateMidfielderRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.2;
    rating += player.passing * 2;
    rating += player.creativity * 1.5;
    rating += player.teamwork * 1.5;
    return rating;
    }
    
    function calculateWingerRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.1;
    rating += player.pace * 1.5; // Высокая скорость
    rating += player.dribbling * 2; // Дриблинг
    rating += player.crossing * 1.5; // Кроссы
    rating += player.finishing * 1; // Завершение атак
    rating += player.goals_scored * 0.2; // Учитываем голы
    rating += player.assists * 0.3; // Учитываем передачи
    return rating;
    }
    
    function calculateForwardRating(player) {
    let rating = 0;
    rating += player.count__matches * 0.5;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.2;
    rating += player.shooting * 2;
    rating += player.finishing * 2;
    rating += player.shot_accuracy * 2;
    rating += player.goals_scored * 0.3; // Учитываем голы
    return rating;
    }

async function createStartingSquad() {
    let startSquad = {
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

    const playerRatings = readyPlayers.map(player => {
        const ratings = [];
        
        for (const position of player.detailed_positions) {
            let rating = 0;

            switch(position) {
                case 'Centreback':
                    rating = calculateCenterBackRating(player);
                    break;
                case 'Leftback': case 'Rightback':
                    rating = calculateFullBackRating(player);
                    break;
                case "Central Attacking Midfielder": case "Central Defensive Midfielder": case "Central Midfielder":
                    rating = calculateMidfielderRating(player);
                    break;
                case "Left Midfielder": case "Right Midfielder":
                    rating = calculateMidfielderRating(player) * 0.9;
                    break;
                case "Left Winger":
                case "Right Winger":
                    rating = calculateWingerRating(player);
                    break;
                case "Centreforward":
                    rating = calculateForwardRating(player);
                    break;
                default:
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
    const startGoalkeeper = chooseBestGoalkeeper(goalkeepers);
    readyPlayers = readyPlayers.filter(player => player.person_id !== startGoalkeeper.person_id);
    startSquad["Goalkeeper"] = startGoalkeeper.person_id;

    const defenders = playerRatings.filter(player => 
        player.detailed_positions.some(position => 
          ['Centreback', 'Leftback', 'Rightback'].includes(position)
        )
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

    let ratings2 = {};
    for (let playerId in ratings) {
        ratings2[playerId] = {
            Leftback: ratings[playerId].Leftback || 0,
            Centreback1: ratings[playerId].Centreback || 0,
            Centreback2: ratings[playerId].Centreback || 0,
            Rightback: ratings[playerId].Rightback || 0
        };
    }

    const defense = findMaxRatingsByPosition(ratings2);
    startSquad["Leftback"] = +defense.Leftback.player;
    startSquad["Rightback"] = +defense.Rightback.player;
    startSquad["Centreback"].push(+defense.Centreback1.player, +defense.Centreback2.player);

    let playersToRemove = new Set(Object.values(defense).map(el => el.player));
    playersToRemove = new Set(Array.from(playersToRemove).map(el => +el));

    readyPlayers = readyPlayers.filter(player => !playersToRemove.has(player.player_id));

    const strikers = readyPlayers.filter(player => player.detailed_positions.includes("Centreforward"));
    const startStriker = chooseBestForward(strikers);
    startSquad["Centreforward"] = startStriker.person_id;
    readyPlayers = readyPlayers.filter(player => player.player_id !== startStriker.person_id);

    const wingers = playerRatings.filter(player => 
        player.detailed_positions.some(position => 
          ['Left Winger', 'Right Winger'].includes(position)
        )
    );
    wingers.forEach(winger => {
        winger.detailed_positions.forEach((position, index) => {
            if (!ratings[winger.player_id]) {
                ratings[winger.player_id] = {};
            }
            ratings[winger.player_id][position] = winger.ratings[index];
        });
    });

    let ratings3 = {};
    for (let playerId in ratings) {
        ratings3[playerId] = {
            'Left Winger': ratings[playerId]['Left Winger'] || 0,
            'Right Winger': ratings[playerId]['Right Winger'] || 0
        };
    }
    const wingersss = findMaxRatingsByPosition(ratings3, ['Left Winger', 'Right Winger']);
    startSquad["Left Winger"] = +wingersss['Left Winger'].player;
    startSquad["Right Winger"] = +wingersss['Right Winger'].player;

    let wingersToRemove = new Set(Object.values(wingersss).map(el => el.player));
    wingersToRemove = new Set(Array.from(wingersToRemove).map(el => +el));
    readyPlayers = readyPlayers.filter(player => !wingersToRemove.has(player.player_id));

    const midfielders = playerRatings.filter(player => 
        player.detailed_positions.some(position => 
          ['Central Attacking Midfielder', 'Central Defensive Midfielder'].includes(position)
        )
    );
    midfielders.forEach(mid => {
        mid.detailed_positions.forEach((position, index) => {
            if (!ratings[mid.player_id]) {
                ratings[mid.player_id] = {};
            }
            ratings[mid.player_id][position] = mid.ratings[index];
        });
    });

    let ratings4 = {};
    for (let playerId in ratings) {
        ratings4[playerId] = {
            'Central Attacking Midfielder': ratings[playerId]['Central Attacking Midfielder'] || 0,
            'Central Defensive Midfielder1': ratings[playerId]['Central Defensive Midfielder'] || 0,
            'Central Defensive Midfielder2': ratings[playerId]['Central Defensive Midfielder'] || 0
        };
    }
    const cm = findMaxRatingsByPosition(ratings4, ['Central Attacking Midfielder', 'Central Defensive Midfielder1', 'Central Defensive Midfielder2']);

    startSquad["Central Attacking Midfielder"] = +cm["Central Attacking Midfielder"].player;
    startSquad["Central Defensive Midfielder"].push(+cm['Central Defensive Midfielder1'].player, +cm['Central Defensive Midfielder2'].player);
    
    let midToRemove = new Set(Object.values(cm).map(el => el.player));
    midToRemove = new Set(Array.from(midToRemove).map(el => +el));
    
    console.log(startSquad);
    return startSquad;
}
module.exports = {createStartingSquad};