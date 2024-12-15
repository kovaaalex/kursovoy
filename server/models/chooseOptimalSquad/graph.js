function findMaxRatingsByPosition(ratings, positions = ['Leftback', 'Centreback1', 'Centreback2', 'Rightback']) {
    let maxRatings = {};
    let uniquePlayers;
    do {
        for (let position of positions) {
            let bestPlayer = null;
            let bestRating = -Infinity;
            Object.keys(ratings).forEach(player => {
                let rating = ratings[player][position];
                if (rating < 0) {
                    return;
                }
                if (rating >= bestRating) {
                    bestRating = rating;
                    bestPlayer = player;
                }
            });
            if (bestPlayer) {
                maxRatings[position] = {
                    player: bestPlayer,
                    rating: bestRating
                };
                if (position === 'Centreback1') {
                    ratings[bestPlayer]["Centreback2"] = 0;
                } else if (position === 'Centreback2') {
                    ratings[bestPlayer]["Centreback1"] = 0;
                } else if (position === 'Central Defensive Midfielder1') {
                    ratings[bestPlayer]["Central Defensive Midfielder2"] = 0;
                } else if (position === 'Central Defensive Midfielder2') {
                    ratings[bestPlayer]["Central Defensive Midfielder1"] = 0;
                }
            }
        }
        let playerPositionsCount = {};
        Object.values(maxRatings).forEach(entry => {
            const player = entry.player;
            if (playerPositionsCount[player]) {
                playerPositionsCount[player]++;
            } else {
                playerPositionsCount[player] = 1;
            }
        });
        const filteredPlayers = Object.entries(playerPositionsCount)
            .filter(([player, count]) => count >= 2)
            .reduce((acc, [player, count]) => {
                acc[player] = count;
                return acc;
            }, {});
        let bestPositionsForFilteredPlayers = {};
        positions.forEach(position => {
            const bestPlayer = maxRatings[position]?.player;
            if (filteredPlayers[bestPlayer]) {
                if (!bestPositionsForFilteredPlayers[bestPlayer]) {
                    bestPositionsForFilteredPlayers[bestPlayer] = [];
                }
                bestPositionsForFilteredPlayers[bestPlayer].push(position);
            }
        });
        let minDiff = Infinity;
        let positionWithMinDiff = '';
        let secondBestPlayerAtMinDiff = '';
        Object.entries(bestPositionsForFilteredPlayers).forEach(([player, ppositions]) => {
            ppositions.forEach(position => {
                let secondBestPlayer = null;
                let secondBestRating = -Infinity;
                Object.keys(ratings).forEach(currentPlayer => {
                    if (currentPlayer !== player) {
                        let currentRating = ratings[currentPlayer][position];
                        if (currentRating > secondBestRating) {
                            secondBestRating = currentRating;
                            secondBestPlayer = currentPlayer;
                        }
                    }
                });
                const ratingDiff = maxRatings[position].rating - secondBestRating;
                if (ratingDiff < minDiff) {
                    minDiff = ratingDiff;
                    positionWithMinDiff = position;
                    secondBestPlayerAtMinDiff = secondBestPlayer;
                }
            });
        });
        if (positionWithMinDiff) {
            const oldPlayer = maxRatings[positionWithMinDiff].player;
            if (oldPlayer) {
                ratings[oldPlayer][positionWithMinDiff] = 0;
            }
            maxRatings[positionWithMinDiff].player = secondBestPlayerAtMinDiff;
            maxRatings[positionWithMinDiff].rating = ratings[secondBestPlayerAtMinDiff][positionWithMinDiff];
        }
        uniquePlayers = [...new Set(Object.values(maxRatings).map(entry => entry.player))];
    } while (uniquePlayers.length < positions.length);
    return maxRatings;
}
module.exports = {findMaxRatingsByPosition}