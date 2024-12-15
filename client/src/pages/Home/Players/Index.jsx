import React, { useState, useEffect } from "react";
import Player from "./Player/Index";
import styles from './Players.module.css';

export default function Players() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [positionFilter, setPositionFilter] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortedByAge, setIsSortedByAge] = useState(true); // Состояние для сортировки по возрасту
    const [isSortedByJoinDate, setIsSortedByJoinDate] = useState(true); // Состояние для сортировки по дате присоединения
    const [isSortedByJerseyNumber, setIsSortedByJerseyNumber] = useState(true); // Состояние для сортировки по номеру футболки

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/players');
                if (!response.ok) {
                    throw new Error('Network response was not okay');
                }
                const data = await response.json();
                setPlayers(data);
                setFilteredPlayers(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, []);

    const handleFilterChange = (position) => {
        setPositionFilter(position);
        if (position) {
            setFilteredPlayers(players.filter(player => player.position === position));
        } else {
            setFilteredPlayers(players);
        }
        setIsFilterOpen(false);
    };

    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    const sortByAge = () => {
        const sortedPlayers = [...filteredPlayers].sort((a, b) => {
            const ageA = new Date(a.birth_date);
            const ageB = new Date(b.birth_date);
            return isSortedByAge ? ageA - ageB : ageB - ageA; // Сортировка по возрасту
        });
        setFilteredPlayers(sortedPlayers);
        setIsSortedByAge(!isSortedByAge); // Меняем направление сортировки
    };

    const sortByJoinDate = () => {
        const sortedPlayers = [...filteredPlayers].sort((a, b) => {
            const joinDateA = new Date(a.joined_at);
            const joinDateB = new Date(b.joined_at);
            return isSortedByJoinDate ? joinDateA - joinDateB : joinDateB - joinDateA; // Сортировка по дате присоединения
        });
        setFilteredPlayers(sortedPlayers);
        setIsSortedByJoinDate(!isSortedByJoinDate); // Меняем направление сортировки
    };

    const sortByJerseyNumber = () => {
        const sortedPlayers = [...filteredPlayers].sort((a, b) => {
            return isSortedByJerseyNumber ? a.jersey_number - b.jersey_number : b.jersey_number - a.jersey_number; // Сортировка по номеру футболки
        });
        setFilteredPlayers(sortedPlayers);
        setIsSortedByJerseyNumber(!isSortedByJerseyNumber); // Меняем направление сортировки
    };

    if (loading) {
        return <p>Loading</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div className={styles.players}>
            <h3>Players</h3>
            <div className={styles.filterContainer}>
                <div className={styles.filterToggle} onClick={toggleFilter}>
                    <img src="/filter.svg" alt="filter" className={styles.filter}/>
                    <p>{positionFilter ? positionFilter : "Choose position"}</p>
                </div>
                {isFilterOpen && (
                    <div className={styles.filterOptions}>
                        <div onClick={() => handleFilterChange('Goalkeeper')}>Goalkeeper</div>
                        <div onClick={() => handleFilterChange('Defender')}>Defender</div>
                        <div onClick={() => handleFilterChange('Midfielder')}>Midfielder</div>
                        <div onClick={() => handleFilterChange('Forward')}>Forward</div>
                        <div onClick={() => handleFilterChange('')}>All</div>
                    </div>
                )}
            </div>
            <button onClick={sortByAge} className={styles.sortButton}>
                Sort by age {isSortedByAge ? "↑" : "↓"}
            </button>
            <button onClick={sortByJoinDate} className={styles.sortButton}>
                Sort by join to club {isSortedByJoinDate ? "↑" : "↓"}
            </button>
            <button onClick={sortByJerseyNumber} className={styles.sortButton}>
                Sort by jersey number {isSortedByJerseyNumber ? "↑" : "↓"}
            </button>
            <div className={styles.players__list}>
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => (
                        <Player key={player.id} player={player} />
                    ))
                ) : (
                    <p>No players found</p>
                )}
            </div>
        </div>
    );
}