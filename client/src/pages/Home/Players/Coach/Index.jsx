import styles from './Coach.module.css'
export default function Coach({coach}) {
    const photoPersonUrl = `/images/${coach.picture}`
    const photoFlagUrl = `/images/countries_flag/${coach.nationality}.webp`
    return (
        <div className={styles.coach} key={coach.id}>
            <div className={styles.info}>
                <div className={styles.name}>{coach.first_name} {coach.last_name}</div>
            </div>
            <img src={photoFlagUrl} alt={photoFlagUrl} className={styles.flag}/>
            <img src={photoPersonUrl} alt={photoPersonUrl} className={styles.person__photo}/>
        </div>
    )
}