// Функция для нахождения максимальных рейтингов по каждой позиции с учетом обнуления для ЦЗ
function findMaxRatingsByPosition(ratings, positions = ['Leftback', 'Centreback1', 'Centreback2', 'Rightback']) {
    let maxRatings = {}; // Сюда будут добавляться лучшие игроки по каждой позиции
    let uniquePlayers;

    do {
        // Проходим по каждой позиции, используя for...of
        for (let position of positions) {
            let bestPlayer = null;
            let bestRating = -Infinity;

            // Проходим по всем игрокам и ищем максимальный рейтинг для текущей позиции
            Object.keys(ratings).forEach(player => {
                let rating = ratings[player][position];

                // Пропускаем игроков с нулевым рейтингом на текущей позиции
                if (rating <= 0) {
                    return;
                }

                // Сравниваем рейтинг игрока с текущим лучшим
                if (rating > bestRating) {
                    bestRating = rating;
                    bestPlayer = player;
                }
            });

            if (bestPlayer) {
                // Назначаем игрока на текущую позицию
                maxRatings[position] = {
                    player: bestPlayer,
                    rating: bestRating
                };

                // Обнуляем рейтинги для ЦЗ1 и ЦЗ2, если назначен игрок
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

        // Подсчитываем, сколько позиций занимает каждый игрок
        let playerPositionsCount = {};

        Object.values(maxRatings).forEach(entry => {
            const player = entry.player;
            if (playerPositionsCount[player]) {
                playerPositionsCount[player]++;
            } else {
                playerPositionsCount[player] = 1;
            }
        });

        // Фильтруем игроков, которые занимают больше одной позиции
        const filteredPlayers = Object.entries(playerPositionsCount)
            .filter(([player, count]) => count >= 2)
            .reduce((acc, [player, count]) => {
                acc[player] = count;
                return acc;
            }, {});


        // Создаем объект с позициями, где игроки из filteredPlayers лучшие
        let bestPositionsForFilteredPlayers = {};

        // Проходим по каждой позиции и ищем, кто лучший на этой позиции
        positions.forEach(position => {
            const bestPlayer = maxRatings[position]?.player;
            if (filteredPlayers[bestPlayer]) {
                // Если игрок из filteredPlayers, то добавляем эту позицию
                if (!bestPositionsForFilteredPlayers[bestPlayer]) {
                    bestPositionsForFilteredPlayers[bestPlayer] = [];
                }
                bestPositionsForFilteredPlayers[bestPlayer].push(position);
            }
        });

        // Теперь для позиций bestPositionsForFilteredPlayers найдем второго лучшего игрока и разницу в рейтингах
        let minDiff = Infinity;
        let positionWithMinDiff = '';
        let secondBestPlayerAtMinDiff = '';

        // Мы хотим заменить лучшего игрока на втором лучшего для минимальной разницы
        Object.entries(bestPositionsForFilteredPlayers).forEach(([player, ppositions]) => {

            ppositions.forEach(position => {
                let secondBestPlayer = null;
                let secondBestRating = -Infinity;

                // Находим второго лучшего игрока на этой позиции
                Object.keys(ratings).forEach(currentPlayer => {
                    // Игрок не должен быть уже лучшим на этой позиции
                    if (currentPlayer !== player) {
                        let currentRating = ratings[currentPlayer][position];
                        if (currentRating > secondBestRating) {
                            secondBestRating = currentRating;
                            secondBestPlayer = currentPlayer;
                        }
                    }
                });

                // Вычисляем разницу между лучшим и вторым лучшим игроком
                const ratingDiff = maxRatings[position].rating - secondBestRating;

                // Если разница меньше минимальной, сохраняем новую минимальную разницу
                if (ratingDiff < minDiff) {
                    minDiff = ratingDiff;
                    positionWithMinDiff = position;
                    secondBestPlayerAtMinDiff = secondBestPlayer;
                }
            });
        });

        // Заменим лучшего игрока на второго лучшего для позиции с минимальной разницей
        if (positionWithMinDiff) {
            
            const oldPlayer = maxRatings[positionWithMinDiff].player;
            if (oldPlayer) {
                ratings[oldPlayer][positionWithMinDiff] = 0;
            }
            // Меняем игрока и его рейтинг
            maxRatings[positionWithMinDiff].player = secondBestPlayerAtMinDiff;
            maxRatings[positionWithMinDiff].rating = ratings[secondBestPlayerAtMinDiff][positionWithMinDiff];
        }

        uniquePlayers = [...new Set(Object.values(maxRatings).map(entry => entry.player))];
    } while (uniquePlayers.length < positions.length);

    return maxRatings;
}
module.exports = {findMaxRatingsByPosition}