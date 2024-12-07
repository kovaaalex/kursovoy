import React, {useState, useEffect} from "react";
import Player from "../Player/Index";
import styles from './Players.module.css'
import Coaches from "../Coaches/Index";
export default function Players() {
    const [players, setPlayers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/players')
                if(!response.ok) {
                    throw new Error('Network response was not okay')
                }
                const data = await response.json()
                setPlayers(data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchPlayers()
    }, [])
    return (
        <>
            <h3>Players and coaching staff</h3>
            <div className={styles.players__list}>
            {players.length > 0 ? (
                    players.map(player => (
                        <Player player= {player}></Player>
                    ))
                ) : (
                    <li>No players found</li>
                )}
            </div>
            <Coaches></Coaches>
        </>
    )
}