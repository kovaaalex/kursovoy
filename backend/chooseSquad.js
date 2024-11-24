const { fetchPersons } = require('./dbaccess');
async function fetchPlayers() {
    try{
    const result = await fetchPersons('SELECT * FROM players INNER JOIN player_stats ON players.player_id = player_stats.player_id')
    const players = result.rows
    return players
    } catch(error) {
        console.error(error)
    }
}
async function filterNotInjuredPlayers() {
    const players = await fetchPlayers()
    const notInjured = players.filter(player => player.is_injured === false)
    return notInjured
}
function chooseBestGoalkeeper(goalkeepers) {
    goalkeepers.sort((a, b) => calculateGoalkeeperRating(b) - calculateGoalkeeperRating(a));
    return goalkeepers[0];
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
function chooseBestPlayers(players, number) {
    players.sort((a, b) => calculateDefenderRating(b) - calculateDefenderRating(a));
    return players.slice(0, number);
}

function calculateDefenderRating(player) {
    let rating = 0;
    rating += player.count__matches * 10;
    const age = new Date().getFullYear() - new Date(player.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += player.height * 0.5 + player.weight * 0.2;
    const joinedAt = new Date(player.joined_at);
    const currentDate = new Date();
    const monthsDifference = (currentDate.getFullYear() * 12 + currentDate.getMonth()) - (joinedAt.getFullYear() * 12 + joinedAt.getMonth());
    rating += (12 - monthsDifference) * 5;
    rating += player.defender_pace * 0.5;
    rating += player.strength * 0.5;
    rating += player.stamina * 0.5;
    rating += player.tackling * 2;
    rating += player.interceptions * 2;
    rating += player.blocked_shots * 2;
    rating += player.crossing * 0.5; 
    rating += player.dribbling * 0.5; 
    rating += player.passing * 0.5;
    return rating;
}
function chooseBestForward(forwards) {
    forwards.sort((a, b) => calculateForwardRating(b) - calculateForwardRating(a));
    return forwards[0];
}

function calculateForwardRating(forward) {
    let rating = 0;
    rating += forward.count__matches * 10;
    const age = new Date().getFullYear() - new Date(forward.birth_date).getFullYear();
    rating += (40 - age) * 2;
    rating += forward.height * 0.5 + forward.weight * 0.2;
    const joinedAt = new Date(forward.joined_at);
    const currentDate = new Date();
    const monthsDifference = (currentDate.getFullYear() * 12 + currentDate.getMonth()) - (joinedAt.getFullYear() * 12 + joinedAt.getMonth());
    rating += (12 - monthsDifference) * 5;

    // Учитываем метрики форварда
    rating += forward.forward_shooting * 2;
    rating += forward.forward_finishing * 2;
    rating += forward.forward_dribbling * 0.5;
    rating += forward.forward_passing * 0.5;
    rating += forward.forward_strength * 0.5;
    rating += forward.forward_stamina * 0.5;
    rating += forward.forward_creativity * 0.5;
    rating += forward.forward_teamwork * 0.5;
    rating += forward.goals_scored * 3; // Учитываем голы
    rating += forward.assists * 2;
    return rating;
}
(async function() {
    let readyPlayers = await filterNotInjuredPlayers()
    /*const chooseSquad = (readyPlayers) => {
        const squad = {
            goalkeeper: null,
            defenders: [],
            defensiveMidfielders: [],
            attackingMidfielder: null,
            wingers: [],
            forward: null
        }
    }*/
    const goalkeepers = readyPlayers.filter(player => player.position === "Goalkeeper")
    const startGoalkeeper = chooseBestGoalkeeper(goalkeepers)
    console.log(startGoalkeeper)
    readyPlayers = readyPlayers.filter(player => player.person_id !== startGoalkeeper.person_id)
    const centerBacks = readyPlayers.filter(player => player.detailed_positions[0] === "Centreback")
    if (centerBacks.length < 4) {
        console.log(`Центральных защитников найдено: ${centerBacks.length}`);
    }
    if (centerBacks.length < 2) {
        const candidates = readyPlayers.filter(player => player.detailed_positions.includes("Centreback"))
        candidates.sort((a, b) => calculatePlayerRating(b) - calculatePlayerRating(a))
        while (centerBacks.length < 3 && candidates.length > 0) {
            centerBacks.push(candidates.shift())
        }
    }
    console.log('Ostalnye', readyPlayers)
    const bestCenterBacks = chooseBestPlayers(centerBacks, 2);
    readyPlayers = readyPlayers.filter(player => player.person_id !== bestCenterBacks[0].person_id && player.person_id !== bestCenterBacks[1].person_id)
    console.log("Лучшие центральные защитники:", bestCenterBacks);
    console.log(readyPlayers)

    const leftBacks = readyPlayers.filter(player => player.detailed_positions[0] === "Leftback");
    const bestLeftBacks = chooseBestPlayers(leftBacks, 1);
    console.log("Лучший левый защитник:", bestLeftBacks);

    readyPlayers = readyPlayers.filter(player => 
        player.person_id !== bestLeftBacks[0].person_id
    );
    const rightBacks = readyPlayers.filter(player => player.detailed_positions[0] === "Rightback");
    const bestRightBacks = chooseBestPlayers(rightBacks, 1); // Выбираем 1 лучшего правого защитника
    console.log("Лучший правый защитник:", bestRightBacks);
    
    // Удаляем выбранного правого защитника из readyPlayers
    readyPlayers = readyPlayers.filter(player => 
        player.person_id !== bestRightBacks[0].person_id
    );
    const forwards = readyPlayers.filter(player => player.position === "Forward");
    const bestForward = chooseBestForward(forwards);
    console.log("Лучший центр форвард:", bestForward);
    readyPlayers = readyPlayers.filter(player => 
        player.person_id !== bestForward.person_id
    );

    const LW = readyPlayers.filter(player => player.detailed_positions.includes("Left Winger"))
    const leftWinger = chooseBestForward(LW);
    console.log("Лучший центр форвард:", leftWinger);
    readyPlayers = readyPlayers.filter(player => 
        player.person_id !== leftWinger.person_id
    );
    const RW = readyPlayers.filter(player => player.detailed_positions.includes("Right Winger"))
    const RightWinger = chooseBestForward(RW);
    console.log("Лучший центр форвард:", RightWinger);
    readyPlayers = readyPlayers.filter(player => 
        player.person_id !== RightWinger.person_id
    );
    const midfielders = readyPlayers.filter(player => player.position === 'Midfielder')
})()
/*Мне надо для каждой позиции (GK, CB, LB/RB, CAM, CDM, LW/RW, ST) */