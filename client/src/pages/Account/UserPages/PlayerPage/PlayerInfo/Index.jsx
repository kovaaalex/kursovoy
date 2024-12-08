import { useEffect, useState } from "react";
import styles from './PlayerInfo.module.css';

function PlayerInfo({ user }) {
    const [playerInjury, setPlayerInjury] = useState([]);

    useEffect(() => {
        const getInjuryById = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/injuries/${user.id}`);
                if (!response.ok) {
                    throw new Error('Invalid id');
                }
                const data = await response.json();
                setPlayerInjury(data);
            } catch (error) {
                alert('Error: ' + error.message);
                console.error('Error:', error);
            }
        };
        getInjuryById();
    }, [user.id]); // Adding user.id to dependencies

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options); // Указана локаль 'en-US'
    };

    return (
        <div className={styles.playerInfo}>
            <h3>Player Injuries</h3>
            {playerInjury.length > 0 ? (
                <ul>
                    {playerInjury.map((injury) => (
                        <li key={injury.injury_id}>
                            <strong>Injury:</strong> {injury.injury_name}<br />
                            <strong>Injury Date:</strong> {formatDate(injury.injury_date)}<br />
                            <strong>Return Date:</strong> {formatDate(injury.return_date)}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No injury information available.</p>
            )}
        </div>
    );
}

export default PlayerInfo;