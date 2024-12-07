import styles from './match.module.css'
import MatchTime from './MatchTime/Index'
import ScoreMatch from './ScoreMatch/Index'
export default function Match({match}) {
    
    return (
        <div className={styles.fullgame}>
            <div className={styles.game}>
                <MatchTime date={match.date}></MatchTime>
                {/* <div className={styles.timestamp}>{separateDateTime(match.date)}</div> */}
                <ScoreMatch match={match}></ScoreMatch>
                
                <div className={styles.stadium}>{match.stadium}</div>
            </div>
        </div>
    )
}