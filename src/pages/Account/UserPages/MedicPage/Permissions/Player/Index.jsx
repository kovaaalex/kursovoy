import styles from './Player.module.css'
function Player({playerId, name, is_injured, number, onChange}) {
    return(
        <div className={styles.player}>
            <p>{name} {number}</p>
            <input 
                type="radio" 
                name={`give_permission_${playerId}`} 
                id={`ready_${playerId}`} 
                checked={!is_injured}
                onChange={onChange}
            />
            <label htmlFor="ready">Ready</label>
            <input 
                type="radio" 
                name={`give_permission_${playerId}`}
                id={`is_injured_${playerId}`}
                checked={is_injured}
                onChange={onChange}
            />
            <label htmlFor="is_injured">Injured</label>
        </div>
    )
}
export default Player