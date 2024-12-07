import styles from './Player.module.css'
export default function Player({player}) {
    const photoPersonUrl = `/images/${player.picture}`
    const photoFlagUrl = `/images/countries_flag/${player.nationality}.webp`
    return (
        <div key={player.id} className={styles.player}>
            <div className={styles.info}>
                <div className={styles.player__number}>{player.jersey_number}</div>
                <div className={styles.name}>{player.first_name} {player.last_name}</div>
            </div>
            <img src={photoFlagUrl} alt={photoFlagUrl} className={styles.flag}/>
            <img src={photoPersonUrl} alt={photoPersonUrl} className={styles.person__photo}/>
        </div>
    )
}