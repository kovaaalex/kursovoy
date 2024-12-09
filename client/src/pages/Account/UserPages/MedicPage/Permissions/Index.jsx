import { useState, useEffect } from 'react';
import Player from './Player/Index';
import styles from './Permissions.module.css';

function Permissions() {
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const handleToggle = async (playerId, selectedStatus) => {
        const updatedPlayers = players.map(player => {
            if (player.player_id === playerId) {
                // Обновляем статус игрока
                return { ...player, is_injured: selectedStatus };
            }
            return player;
        });

        setPlayers(updatedPlayers);

        try {
            const response = await fetch(`http://localhost:5000/api/injuries/put/${playerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_injured: selectedStatus }) // Используем выбранный статус
            });
            if (!response.ok) {
                throw new Error('Failed to update player status');
            }
        } catch (error) {
            console.error('Error updating player status:', error);
            setError(error.message);
        }
    };

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/players/current');
                if (!response.ok) {
                    throw new Error("Response was not okay");
                }
                const data = await response.json();
                setPlayers(data);
            } catch (error) {
                console.error('Error fetching squad:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.players}>
            <h2>Permissions</h2>
            {players.map((player) => (
                <Player
                    key={player.player_id}
                    playerId={player.player_id}
                    name={player.name}
                    is_injured={player.is_injured}
                    number={player.jersey_number}
                    onChange={(status) => handleToggle(player.player_id, status)} // Передаем статус
                />
            ))}
        </div>
    );
}

export default Permissions;