import React, { useState, useEffect } from 'react';
import styles from './Squad.module.css';
import Line from './Line/Index';
import Bench from './Line/Bench/Index';
import FileDownloader from '../../../Components/FileDownloader/Index';
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
                    // Если сервер вернул ошибку, обрабатываем ее
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Ошибка при загрузке состава');
                }
                
                const data = await response.json();
                console.log(data); 
                setSquad(data[0]);
                setBench(data[1]); 
            } catch (error) {
                console.error('Error fetching squad:', error);
                setError(error.message); // Устанавливаем сообщение об ошибке
            } finally {
                setLoading(false);
            }
        };

        fetchSquad();
    }, []);
    const playersByPosition = squad.reduce((acc, player) => {
        if (!acc[player.position]) {
            acc[player.position] = [];
        }
        acc[player.position].push(player);
        return acc;
    }, {});
    const handlePlayerClick = (player) => {
        let benchPl = false
        let clickedPlayer = squad.find((pl) => pl.jersey_number === player.jersey_number);
        if(!clickedPlayer)
        {
            clickedPlayer = bench.find((pl) => pl.jersey_number === player.jersey_number)
            setBenchPlayer(true)
            benchPl = true
        }
        alert(`ID кликнутого игрока: ${clickedPlayer.id}`);
        
        if (!selectedPlayer) {
            setSelectedPlayer(clickedPlayer);
        } else {
            if (selectedPlayer.jersey_number === clickedPlayer.jersey_number) {
                alert('Вы нажали на одного и того же игрока');
                setSelectedPlayer(null);
                return;
            }
            if(!selectedPlayer.position && !clickedPlayer.position) {
                setSelectedPlayer(null)
                return
            }
            else if (!selectedPlayer.position || !clickedPlayer.position) {
                let temp = {...selectedPlayer}
                setSquad((prevSquad) =>
                    prevSquad.map((pl) => {
                        if (pl.jersey_number === clickedPlayer.jersey_number) {
                            return { ...pl, id:selectedPlayer.id, is_injured: selectedPlayer.is_injured, detailed_positions: selectedPlayer.detailed_positions, name: selectedPlayer.name, jersey_number:selectedPlayer.jersey_number }; // Кликнутый получает позицию выбранного
                        }
                        if (pl.jersey_number === selectedPlayer.jersey_number) {
                            return { ...pl, id:clickedPlayer.id, is_injured: clickedPlayer.is_injured, detailed_positions: clickedPlayer.detailed_positions, name: clickedPlayer.name, jersey_number:clickedPlayer.jersey_number }; // Выбранный получает позицию кликнутого
                        }
                        return pl;
                    })
                );
                setBench((prevSquad) =>
                    prevSquad.map((pl) => {
                        if (pl.jersey_number === clickedPlayer.jersey_number) {
                            return { ...pl, id:selectedPlayer.id, is_injured: selectedPlayer.is_injured, detailed_positions: selectedPlayer.detailed_positions, name: selectedPlayer.name, jersey_number:selectedPlayer.jersey_number }; // Кликнутый получает позицию выбранного
                        }
                        if (pl.jersey_number === selectedPlayer.jersey_number) {
                            return { ...pl, id:clickedPlayer.id, is_injured: clickedPlayer.is_injured, detailed_positions: clickedPlayer.detailed_positions, name: clickedPlayer.name, jersey_number:clickedPlayer.jersey_number }; // Выбранный получает позицию кликнутого
                        }
                        return pl;
                    })
                );
                setSelectedPlayer(null)
                return
            }
            else {
                const tempPosition = clickedPlayer.position;
        
                setSquad((prevSquad) =>
                    prevSquad.map((pl) => {
                        if (pl.jersey_number === selectedPlayer.jersey_number) {
                            return { ...pl, position: tempPosition };
                        }
                        if (pl.jersey_number === clickedPlayer.jersey_number) {
                            return { ...pl, position: selectedPlayer.position }; 
                        }
                        return pl;
                    })
                );
        
                setSelectedPlayer(null);
            }
        }
    };
    const handleSave = async () => {
        const squadForExport = squad.map(player => ({
            name: player.name,
            jersey_number: player.jersey_number,
            position: player.position,
            detailed_positions: player.detailed_positions.join(', '),
            is_injured: player.is_injured ? 'TRUE' : 'FALSE'
        }));
    
        const benchForExport = bench.map(player => ({
            name: player.name,
            jersey_number: player.jersey_number,
            position: 'bench',
            detailed_positions: player.detailed_positions.join(', '),
            is_injured: player.is_injured ? 'TRUE' : 'FALSE'
        }));
    
        try {
            const response = await fetch('http://localhost:5000/api/squad/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ squad: squadForExport, bench: benchForExport }),
            });
    
            if (!response.ok) {
                throw new Error('Не удалось сохранить состав');
            }
    
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'squad.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Ошибка при сохранении состава:', error);
            alert('Ошибка при сохранении состава: ' + error.message);
        }
    };
    
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <>
            <div>Error: {error}</div>
            <FileDownloader/>
        </>;
    }

    return (
        <div className={styles.squad}>
            <h2>Squad</h2>
            <div className={styles.fullSquad}>
                <div className={styles.lineup}>
                    <Line
                        players={playersByPosition["Goalkeeper"].map(player => ({
                            jersey_number: player.jersey_number,
                            name: player.name,
                            position: player.position,
                            detailed_positions: player.detailed_positions
                        }))}
                        onPlayerClick={handlePlayerClick}
                    />
                    <Line
                        players={[
                            ...playersByPosition["Rightback"],
                            ...playersByPosition["Centreback"].slice(0, 2), // Берем первых двух
                            playersByPosition["Leftback"][0] // Берем только одного левого защитника
                        ].map(player => ({
                            jersey_number: player.jersey_number,
                            name: player.name,
                            position: player.position,
                            detailed_positions: player.detailed_positions
                        }))}
                        onPlayerClick={handlePlayerClick}
                    />
                    <Line
                        players={playersByPosition["Central Defensive Midfielder"].slice(0, 2).map(player => ({
                            jersey_number: player.jersey_number,
                            name: player.name,
                            position: player.position,
                            detailed_positions: player.detailed_positions
                        }))}
                        onPlayerClick={handlePlayerClick}
                    />
                    <Line
                        players={[
                            playersByPosition["Right Winger"][0],
                            playersByPosition["Central Attacking Midfielder"][0],
                            playersByPosition["Left Winger"][0]
                        ].map(player => ({
                            jersey_number: player.jersey_number,
                            name: player.name,
                            position: player.position,
                            detailed_positions: player.detailed_positions
                        }))}
                        onPlayerClick={handlePlayerClick}
                    />
                    <Line
                        players={playersByPosition["Centreforward"].map(player => ({
                            jersey_number: player.jersey_number,
                            name: player.name,
                            position: player.position,
                            detailed_positions: player.detailed_positions
                        }))}
                        onPlayerClick={handlePlayerClick}
                    />
                </div>
                <Bench bench={bench} onClick={handlePlayerClick}></Bench>
            </div>
            <button onClick={handleSave} className={styles.saveButton}>
                Save Squad to Excel
            </button>
            <FileDownloader />

        </div>
    );
}

export default Squad;