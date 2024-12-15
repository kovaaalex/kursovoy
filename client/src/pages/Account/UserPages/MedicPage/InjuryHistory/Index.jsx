import { useState, useEffect } from "react";
import styles from './InjuryHistory.module.css'
function InjuryHistory() {
    const [injuries, setInjuries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const allInjuries = async () => {
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
        allInjuries();
    }, []);
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-En', options);
    };
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.selectInjuries}>
            <h2>All Injuries</h2>
            {injuries.length > 0 ? (
                <ul className={styles.injuryList}>
                    {injuries.map((injury) => (
                        <li key={injury.injury_id} className={styles.injuryItem}>
                            {injury.name} - {injury.injury_name} (Since: {formatDate(injury.injury_date)} Due to: {formatDate(injury.return_date)})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No injuries found.</p>
            )}
        </div>
    );
}

export default InjuryHistory;