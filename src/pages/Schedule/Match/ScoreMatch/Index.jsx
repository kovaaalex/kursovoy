import styles from './ScoreMatch.module.css'
export default function ScoreMatch({match}) {
    const homeTeamImg = `/images/clublogo/${match.homelogo}`
    const awayTeamImg = `/images/clublogo/${match.awaylogo}`
    return (
        <div className={styles.scorematch} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }} key={match.id}>
                <div className={styles.team} id={styles.hometeam}>
                    <div className={styles.team__info}>
                        <img src={homeTeamImg} alt={homeTeamImg} />
                        <p>{match.hometeam}</p>
                    </div>
                    <div className={styles.team__scores}>
                        <h2>{match.score_home}</h2>
                    </div>
                </div>
                <h2>:</h2>
                <div className={styles.team} id={styles.awayteam}>   
                    <div className={styles.team__scores}>
                        <h2>{match.score_away}</h2>
                    </div>
                    <div className={styles.team__info}>
                        <img src={awayTeamImg} alt={awayTeamImg} />
                        <p>{match.awayteam}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}