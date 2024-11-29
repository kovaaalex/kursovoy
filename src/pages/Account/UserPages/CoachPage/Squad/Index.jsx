// Squad.jsx
import React, { useState, useEffect } from 'react';
import styles from './Squad.module.css';
import Line from './Line/Index';
import Bench from './Line/Bench/Index';
import * as XLSX from 'xlsx';
function Squad() {
    const [squad, setSquad] = useState([]);
    const [bench, setBench] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isBenchPlayer, setBenchPlayer] = useState(false)

    useEffect(() => {
        const fetchSquad = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/squad');
                if (!response.ok) {
                    throw new Error("Response was not okay");
                }
                const data = await response.json();
                console.log(data); // Log the data for debugging
                setSquad(data[0]); // Set the squad data
                setBench(data[1]); // Set the squad data
            } catch (error) {
                console.error('Error fetching squad:', error);
                setError(error.message); // Set error message
            } finally {
                setLoading(false);
            }
        };

        fetchSquad();
    }, []);
    const handlePlayerClick = (player) => {
        let benchPl = false
        let clickedPlayer = squad.find((pl) => pl.jersey_number === player.jersey_number); // Найти игрока, по которому кликнули
        if(!clickedPlayer)
        {
            clickedPlayer = bench.find((pl) => pl.jersey_number === player.jersey_number)
            setBenchPlayer(true)
            benchPl = true
        }
        alert(`ID кликнутого игрока: ${clickedPlayer.id}`);
        
        if (!selectedPlayer) {
            setSelectedPlayer(clickedPlayer); // Сохраняем выбранного игрока
        } else {
            if (selectedPlayer.jersey_number === clickedPlayer.jersey_number) {
                alert('Вы нажали на одного и того же игрока');
                setSelectedPlayer(null);
                return;
            }
            if(!selectedPlayer.squadPosition && !clickedPlayer.squadPosition) {
                setSelectedPlayer(null)
                return
            }
            else if (!selectedPlayer.squadPosition || !clickedPlayer.squadPosition) {
                let temp = {...selectedPlayer}
                setSquad((prevSquad) =>
                    prevSquad.map((pl) => {
                        if (pl.jersey_number === clickedPlayer.jersey_number && selectedPlayer.detailed_positions.includes(pl.squadPosition)) {
                            return { ...pl, id:selectedPlayer.id, is_injured: selectedPlayer.is_injured, detailed_positions: selectedPlayer.detailed_positions, fullName: selectedPlayer.fullName, jersey_number:selectedPlayer.jersey_number }; // Кликнутый получает позицию выбранного
                        }
                        if (pl.jersey_number === selectedPlayer.jersey_number && clickedPlayer.detailed_positions.includes(pl.squadPosition)) {
                            return { ...pl, id:clickedPlayer.id, is_injured: clickedPlayer.is_injured, detailed_positions: clickedPlayer.detailed_positions, fullName: clickedPlayer.fullName, jersey_number:clickedPlayer.jersey_number }; // Выбранный получает позицию кликнутого
                        }
                        return pl; // Остальные остаются без изменений
                    })
                );
                setBench((prevSquad) =>
                    prevSquad.map((pl) => {
                        if (pl.jersey_number === clickedPlayer.jersey_number && pl.detailed_positions.includes(selectedPlayer.squadPosition)) {
                            return { ...pl, id:selectedPlayer.id, is_injured: selectedPlayer.is_injured, detailed_positions: selectedPlayer.detailed_positions, fullName: selectedPlayer.fullName, jersey_number:selectedPlayer.jersey_number }; // Кликнутый получает позицию выбранного
                        }
                        if (pl.jersey_number === selectedPlayer.jersey_number && pl.detailed_positions.includes(clickedPlayer.squadPosition)) {
                            return { ...pl, id:clickedPlayer.id, is_injured: clickedPlayer.is_injured, detailed_positions: clickedPlayer.detailed_positions, fullName: clickedPlayer.fullName, jersey_number:clickedPlayer.jersey_number }; // Выбранный получает позицию кликнутого
                        }
                        return pl; // Остальные остаются без изменений
                    })
                );
                setSelectedPlayer(null)
                return
            }
            else if(!selectedPlayer.detailed_positions.includes(clickedPlayer.squadPosition) || !clickedPlayer.detailed_positions.includes(selectedPlayer.squadPosition)) {
                alert(`${clickedPlayer.fullName} and ${selectedPlayer.fullName} can't swap`)
                
                setSelectedPlayer(null);
                return
            } else {
                // Используем временную переменную для обмена позиций
                const tempPosition = clickedPlayer.squadPosition;
        
                setSquad((prevSquad) =>
                    prevSquad.map((pl) => {
                        if (pl.jersey_number === selectedPlayer.jersey_number) {
                            return { ...pl, squadPosition: tempPosition }; // Выбранный получает позицию кликнутого
                        }
                        if (pl.jersey_number === clickedPlayer.jersey_number) {
                            return { ...pl, squadPosition: selectedPlayer.squadPosition }; // Кликнутый получает позицию выбранного
                        }
                        return pl; // Остальные остаются без изменений
                    })
                );
        
                setSelectedPlayer(null); // Сбрасываем выбранного игрока
            }
        }
    };
    const handleSave = () => {
        const squadForExport = squad.map(player => ({
            fullName: player.fullName,
            jersey_number: player.jersey_number,
            squadPosition: player.squadPosition,
            detailed_positions: player.detailed_positions.join(', '),
            is_injured: player.is_injured ? 'TRUE' : 'FALSE'
        }));
    
        const ws = XLSX.utils.json_to_sheet(squadForExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Squad");
    
        const benchForExport = bench.map(player => ({
            fullName: player.fullName,
            jersey_number: player.jersey_number,
            squadPosition: 'bench',
            detailed_positions: player.detailed_positions.join(', '),
            is_injured: player.is_injured ? 'TRUE' : 'FALSE'
        }));
    
        const benchWs = XLSX.utils.json_to_sheet(benchForExport);
        XLSX.utils.book_append_sheet(wb, benchWs, "Bench");
    
        // Сохранение файла в браузере
        XLSX.writeFile(wb, "squad.xlsx"); // Укажите только имя файла
    };
    
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <>
        
        <div className={styles.fullSquad}>
        <div className={styles.lineup}>
            <Line
                players={[{
                    jersey_number: squad.find(player => player.squadPosition === 'Goalkeeper')?.jersey_number,
                    fullName: squad.find(player => player.squadPosition === 'Goalkeeper')?.fullName
                }] } 
                onPlayerClick={handlePlayerClick}
            />
            <Line
                players={[
                    {
                        jersey_number: squad.find(player => player.squadPosition === "Rightback")?.jersey_number,
                        fullName: squad.find(player => player.squadPosition === "Rightback")?.fullName
                    },
                    {
                        jersey_number: squad.filter(player => player.squadPosition === "Centreback")[0]?.jersey_number,
                        fullName: squad.filter(player => player.squadPosition === "Centreback")[0]?.fullName
                    },
                    {
                        jersey_number: squad.filter(player => player.squadPosition === "Centreback")[1]?.jersey_number,
                        fullName: squad.filter(player => player.squadPosition === "Centreback")[1]?.fullName
                    },
                    {
                        jersey_number: squad.find(player => player.squadPosition === "Leftback")?.jersey_number,
                        fullName: squad.find(player => player.squadPosition === "Leftback")?.fullName
                    }
                ]}
                onPlayerClick={handlePlayerClick}

            />
            <Line
                players={[
                    {
                        jersey_number: squad.filter(player => player.squadPosition === "Central Defensive Midfielder")[0]?.jersey_number,
                        fullName: squad.filter(player => player.squadPosition === "Central Defensive Midfielder")[0]?.fullName
                    },
                    {
                        jersey_number: squad.filter(player => player.squadPosition === "Central Defensive Midfielder")[1]?.jersey_number,
                        fullName: squad.filter(player => player.squadPosition === "Central Defensive Midfielder")[1]?.fullName
                    }
                ]}
                onPlayerClick={handlePlayerClick}

            />
            <Line
                players={[
                    {
                        jersey_number: squad.find(player => player.squadPosition === "Right Winger")?.jersey_number,
                        fullName: squad.find(player => player.squadPosition === "Right Winger")?.fullName
                    },
                    {
                        jersey_number: squad.find(player => player.squadPosition === "Central Attacking Midfielder")?.jersey_number,
                        fullName: squad.find(player => player.squadPosition === "Central Attacking Midfielder")?.fullName
                    },
                    {
                        jersey_number: squad.find(player => player.squadPosition === "Left Winger")?.jersey_number,
                        fullName: squad.find(player => player.squadPosition === "Left Winger")?.fullName
                    }
                ]}
                onPlayerClick={handlePlayerClick}

            />
            <Line
                players={[{
                    jersey_number: squad.find(player => player.squadPosition === "Centreforward")?.jersey_number,
                    fullName: squad.find(player => player.squadPosition === "Centreforward")?.fullName
                }]}
                onPlayerClick={handlePlayerClick}

            />
        </div>
        <Bench bench={bench} onClick={handlePlayerClick}></Bench>
        <button onClick={handleSave} className={styles.saveButton}>
                    Save Squad to Excel
                </button>
        </div>
        </>
    );
}

export default Squad;