import styles from './match.module.css'
import MatchTime from './MatchTime/Index'
export default function Match({match}) {
    
    return (
        <div className={styles.fullgame}>
            <div className={styles.game}>
                <MatchTime date={match.date}></MatchTime>
                {/* <div className={styles.timestamp}>{separateDateTime(match.date)}</div> */}
                <div className={styles.scorematch}>
                    <div style={{ display: 'flex' }} key={match.id}>
                        <p>{match.hometeam}</p>
                        <p>{match.awayteam}</p>
                    </div>
                </div>
                <div className={styles.stadium}>{match.stadium}</div>
            </div>
        </div>
    )
}