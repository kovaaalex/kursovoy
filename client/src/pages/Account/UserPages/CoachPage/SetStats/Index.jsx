import { useState, useEffect } from "react";
import styles from './SetStats.module.css';

function SetStats() {
    const positions = [
        "Leftback", "Rightback", "Centreback", "Central Defensive Midfielder", 
        "Central Midfielder", "Central Attacking Midfielder", "Left Winger", 
        "Right Winger", "Centreforward"
    ];
    const [playerWithoutStats, setPlayerWithoutStats] = useState([]);
    const [isPlayersDropdownOpen, setPlayersDropdownOpen] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [pace, setPace] = useState(0);
    const [crossing, setCrossing] = useState(0);
    const [shooting, setShooting] = useState(0);
    const [finishing, setFinishing] = useState(0);
    const [shot_accuracy, setShotAccuracy] = useState(0);
    const [passing, setPassing] = useState(0);
    const [teamwork, setTeamwork] = useState(0);
    const [creativity, setCreativity] = useState(0);
    const [dribbling, setDribbling] = useState(0);
    const [strength, setStrength] = useState(0);
    const [tackling, setTackling] = useState(0);
    const [interceptions, setInterceptions] = useState(0);
    const [blocked_shots, setBlockedShots] = useState(0);
    const [forward_heading, setForwardHeading] = useState(0);
    const [stamina, setStamina] = useState(0);

    const [selectedPositions, setSelectedPositions] = useState([]);
    useEffect(() => {
        const getPlayersWithoutStats = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/getPlayersWithoutStats');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPlayerWithoutStats(data);
            } catch (error) {
                console.error('Error fetching players without stats:', error);
                alert('Ошибка при загрузке игроков без статистики: ' + error.message);
            }
        };
        getPlayersWithoutStats();
    }, []);
    const handlePositionChange = (position) => {
        setSelectedPositions(prev => 
            prev.includes(position) 
                ? prev.filter(p => p !== position) 
                : [...prev, position]
        );
    };
    const handleSubmit = async () => {
        if (!selectedPerson) {
            alert("Пожалуйста, выберите игрока.");
            return;
        }

        const playerStats = {
            player_id: selectedPerson.id,
            pace,
            crossing,
            shooting,
            finishing,
            shot_accuracy,
            passing,
            teamwork,
            creativity,
            dribbling,
            strength,
            tackling,
            interceptions,
            blocked_shots,
            forward_heading,
            stamina,
        };

        try {
            const response = await fetch(`/api/postPlayerStats/${selectedPerson.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(playerStats),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            alert('Статистика игрока успешно обновлена: ' + result.message);
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
            alert('Ошибка при отправке данных: ' + error.message);
        }
    };

    return (
        <div className={styles.setStatsContainer}>
            <h2>Set Stats {selectedPerson ? selectedPerson.name : ""}</h2>
            <div onClick={() => setPlayersDropdownOpen(!isPlayersDropdownOpen)} className={styles.selectPlayer}>Select player</div>
            {isPlayersDropdownOpen && (
                <div className={styles.characters}>
                    {playerWithoutStats.map(character => (
                        <div
                            key={character.id}
                            className={styles.character}
                            onClick={() => {
                                setSelectedPerson(character);
                                alert(character.player_id);
                                setPlayersDropdownOpen(false);
                            }}
                        >
                            {character.name}
                        </div>
                    ))}
                </div>
            )}
            <div>
                <h3>Select Positions</h3>
                {positions.map(position => (
                    <label key={position}>
                        <input
                            type="checkbox"
                            checked={selectedPositions.includes(position)}
                            onChange={() => handlePositionChange(position)}
                        />
                        {position}
                    </label>
                ))}
            </div>
            <label>
                Pace:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={pace}
                    onChange={(e) => setPace(Number(e.target.value))}
                />
            </label>
            <label>
                Crossing:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={crossing}
                    onChange={(e) => setCrossing(Number(e.target.value))}
                />
            </label>
            <label>
                Shooting:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={shooting}
                    onChange={(e) => setShooting(Number(e.target.value))}
                />
            </label>
            <label>
                Finishing:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={finishing}
                    onChange={(e) => setFinishing(Number(e.target.value))}
                />
            </label>
            <label>
                Shot Accuracy:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={shot_accuracy}
                    onChange={(e) => setShotAccuracy(Number(e.target.value))}
                />
            </label>
            <label>
                Passing:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={passing}
                    onChange={(e) => setPassing(Number(e.target.value))}
                />
            </label>
            <label>
                Creativity:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={creativity}
                    onChange={(e) => setCreativity(Number(e.target.value))}
                />
            </label>
            <label>
                Teamwork:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={teamwork}
                    onChange={(e) => setTeamwork(Number(e.target.value))}
                />
            </label>
            <label>
                Dribbling:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={dribbling}
                    onChange={(e) => setDribbling(Number(e.target.value))}
                />
            </label>
            <label>
                Strength:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={strength}
                    onChange={(e) => setStrength(Number(e.target.value))}
                />
            </label>
            <label>
                Tackling:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={tackling}
                    onChange={(e) => setTackling(Number(e.target.value))}
                />
            </label>
            <label>
                Interceptions:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={interceptions}
                    onChange={(e) => setInterceptions(Number(e.target.value))}
                />
            </label>
            <label>
                Blocked Shots:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={blocked_shots}
                    onChange={(e) => setBlockedShots(Number(e.target.value))}
                />
            </label>
            <label>
                Forward Heading:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={forward_heading}
                    onChange={(e) => setForwardHeading(Number(e.target.value))}
                />
            </label>
            <label>
                Stamina:
                <input
                    type="number"
                    min="1"
                    max="99"
                    value={stamina}
                    onChange={(e) => setStamina(Number(e.target.value))}
                />
            </label>
            <button onClick={handleSubmit} className={styles.submitStats}>Submit Stats</button>
        </div>
    );
}

export default SetStats;