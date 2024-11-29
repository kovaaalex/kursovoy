import React from 'react';
import styles from './StartPlayer.module.css';

function StartPlayer({ jerseyNumber, fullName, onClick }) {
    return (
        <div
            className={styles.player}
            onClick={onClick} // Передаём событие клика
        >
            <div className={styles.player__circle}>
                {jerseyNumber}
            </div>
            <p className={styles.playername}>
                {fullName}
            </p>
        </div>
    );
}

export default StartPlayer;
