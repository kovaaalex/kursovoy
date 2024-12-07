import styles from './Player.module.css'
function Player({playerId, name, is_injured, number, onChange}) {
    return (
        <div className={styles.player}>
            <p>{name} {number}</p>
            <div className={styles.radioGroup}>
                <input 
                    type="radio" 
                    name={`give_permission_${playerId}`} 
                    id={`ready_${playerId}`} 
                    checked={!is_injured}
                    onChange={onChange}
                    className={styles.radioInput}
                />
                <label htmlFor={`ready_${playerId}`} className={styles.radioLabel}>Ready</label>
                
                <input 
                    type="radio" 
                    name={`give_permission_${playerId}`}
                    id={`is_injured_${playerId}`}
                    checked={is_injured}
                    onChange={onChange}
                    className={styles.radioInput}
                />
                <label htmlFor={`is_injured_${playerId}`} className={styles.radioLabel}>Injured</label>
            </div>
        </div>
    );
}
export default Player