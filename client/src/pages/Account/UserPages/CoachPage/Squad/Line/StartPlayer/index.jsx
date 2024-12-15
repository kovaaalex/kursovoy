import React from 'react';
import styles from './StartPlayer.module.css';

function StartPlayer({ jerseyNumber, name, position, detailed_positions, onClick }) {
    console.log({ jerseyNumber, name, position, detailed_positions });

    return (
        <div
            className={styles.player}
            onClick={onClick}
        >
            <div className={`${styles.player__circle} ${Array.isArray(detailed_positions) && detailed_positions.includes(position) ? styles.green : styles.red}`}>
                {jerseyNumber}
            </div>

            <p className={styles.playername}>
                {name}
            </p>
        </div>
    );
}

export default StartPlayer;