import React from 'react';
import StartPlayer from './StartPlayer';
import styles from './Line.module.css';

function Line({ players, onPlayerClick }) {
    return (
        <div className={styles.line}>
            {players.map((player) => (
                <StartPlayer
                    key={player.id}
                    jerseyNumber={player.jersey_number}
                    name={player.name}
                    position={player.position}
                    detailed_positions={player.detailed_positions}
                    onClick={() => onPlayerClick(player)}
                />
            ))}
        </div>
    );
}

export default Line;    