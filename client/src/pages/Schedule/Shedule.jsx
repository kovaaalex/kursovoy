import {useState, useEffect} from 'react'
import Match from './Match/Index'
import Header from '../../components/Header/Index'
import styles from './Schedule.module.css'
function Sсhedule(){
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    useEffect(() => {
        const fetchMatches = async() => {
            try {
                const response = await fetch('http://localhost:5000/api/schedule')
                if(!response.ok) {
                    throw new Error("Network response was not okay'")
                }
                const data = await response.json()
                setMatches(data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }
        fetchMatches()
    }, [])
    return (
        <div className={styles.schedulePage}>
            <Header></Header>
            <div className={styles.matches}>
                {
                    matches.length > 0 ? (
                        matches.map(match => (
                            <Match match={match}></Match>
                        ))
                    ) : (<h2>нет матчей</h2>) 
                }
            </div>
        </div>
    )
}
export default Sсhedule