import React from 'react';
import StartPlayer from './StartPlayer/index';
import styles from './Line.module.css';

function Line({ players, onPlayerClick }) {
    return (
        <div className={styles.line}>
            {players.map((player) => (
                <StartPlayer
                    key={player.id} // Убедитесь, что player.id уникален
                    jerseyNumber={player.jersey_number}
                    fullName={player.fullName}
                    onClick={() => onPlayerClick(player)}
                />
            ))}
        </div>
    );
}

export default Line;