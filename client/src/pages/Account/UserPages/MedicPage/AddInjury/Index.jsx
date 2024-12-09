import { useState, useEffect } from 'react';
import styles from './AddInjury.module.css';

function AddInjury() {
    const [players, setPlayers] = useState([]);
    const [injuries, setInjuries] = useState([]);
    const [injuriesList, setInjuriesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPlayers, setShowPlayers] = useState(false);
    const [showInjuries, setShowInjuries] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [selectedInjury, setSelectedInjury] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [recoveryDays, setRecoveryDays] = useState(0);

    useEffect(() => {
        const getPlayers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/players/current');
                if (!response.ok) {
                    throw new Error("Network response was not okay");
                }
                const data = await response.json();
                setPlayers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        const getInjuries = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/injuries');
                if (!response.ok) {
                    throw new Error("Network response was not okay");
                }
                const data = await response.json();
                setInjuries(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        const getInjuriesList = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/injuries/list');
                if (!response.ok) {
                    throw new Error("Network response was not okay");
                }
                const data = await response.json();
                setInjuriesList(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        getPlayers();
        getInjuries();
        getInjuriesList()
    }, []);

    const handlePlayerSelect = (name) => {
        setSelectedPlayer(name);
        setShowPlayers(false);
    };

    const handleInjurySelect = (name, min_recovery_days) => {
        setSelectedInjury(name);
        setShowInjuries(false);
        setRecoveryDays(min_recovery_days);
        const start = new Date(startDate);
        start.setDate(start.getDate() + min_recovery_days);
        setEndDate(start.toISOString().split('T')[0]);
    };

    const handleSave = async () => {
        const playerId = players.find(player => player.name === selectedPlayer)?.player_id;
        const injuryId = injuries.find(injury => injury.injury_name === selectedInjury)?.injury_id;

        if (!playerId || !injuryId) {
            alert("Please select both a player and an injury.");
            return;
        }

        const payload = {
            injury_id: injuryId,
            player_id: playerId,
            start_date: startDate,
            end_date: endDate,
        };

        try {
            const response = await fetch('http://localhost:5000/api/injuries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to save injury data.");
            }

            alert("Injury data saved successfully!");
            setSelectedPlayer('');
            setSelectedInjury('');
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate(new Date().toISOString().split('T')[0]);
            setRecoveryDays(0);
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Add Injury</h2>
            <input 
                type="text" 
                placeholder="Select Player"
                value={selectedPlayer} 
                onFocus={() => setShowPlayers(true)} 
                onChange={(e) => setSelectedPlayer(e.target.value)} 
                className={styles.input}
            />
            {showPlayers && (
                <div className={styles.dropdown}>
                    {players.map((player) => (
                        <p key={player.id} onClick={() => handlePlayerSelect(player.name)} className={styles.dropdownItem}>
                            {player.name}
                        </p>
                    ))}
                </div>
            )}
            <input 
                type="text" 
                placeholder="Select Injury" 
                value={selectedInjury} 
                onFocus={() => setShowInjuries(true)} 
                onChange={(e) => setSelectedInjury(e.target.value)} 
                className={styles.input}
            />
            {showInjuries && (
                <div className={styles.dropdown}>
                    {injuriesList.map((injury) => (
                        <p key={injury.id} onClick={() => handleInjurySelect(injury.injury_name, injury.min_recovery_days)} className={styles.dropdownItem}>
                            {injury.injury_name}
                        </p>
                    ))}
                </div>
            )}
            <div className={styles.dateFields}>
                <label htmlFor="start-date">Start Date:</label>
                <input 
                    type="date" 
                    id="start-date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className={styles.dateInput}
                />
                <label htmlFor="end-date">End Date:</label>
                <input 
                    type="date" 
                    id="end-date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    className={styles.dateInput}
                />
            </div>
            <button onClick={handleSave} className={styles.saveButton}>Save</button>
        </div>
    );
}

export default AddInjury;