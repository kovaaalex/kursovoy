import {useState, useEffect} from 'react'
import Player from './Player/Index';
import styles from './Permissions.module.css'
function Permissions() {
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const handleToggle = async (playerId, is_injured) => {
        const updatedPlayers = players.map(player => {
            if(player.player_id === playerId) {
                return { ...player, is_injured: !is_injured }
            }
            return player
        })
        setPlayers(updatedPlayers)
        try {
            alert(playerId)
            const response = await fetch(`http://localhost:5000/api/updatePlayerPermission/${playerId}`,  {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_injured: !is_injured })
            })
            if (!response.ok) {
                throw new Error('Failed to update player status')
            }
        } catch (error) {
            console.error('Error updating player status:', error)
            setError(error.message)
        }
    };
    useEffect(() =>{
        const fetchPlayers = async() => {
            try {
                const response = await fetch('http://localhost:5000/api/currentplayers');
                if (!response.ok) {
                    throw new Error("Response was not okay");
                }
                const data = await response.json();
                setPlayers(data)
                alert(players)
            } catch (error) {
                console.error('Error fetching squad:', error);
                setError(error.message); // Set error message
            } finally {
                setLoading(false);
            }
        }
        fetchPlayers()
    }, [])
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
                    onChange={() => handleToggle(player.player_id, player.is_injured)}
                />
            ))}
        </div>
    )
}
export default Permissions