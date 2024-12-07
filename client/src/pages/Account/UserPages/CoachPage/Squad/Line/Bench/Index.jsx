import styles from './Bench.module.css'; // Импортируем стили
function Bench({ bench, onClick }) {
    const ready = bench.filter(pl => !pl.is_injured);
    const injured = bench.filter(pl => pl.is_injured);
    return (
        <div className={styles.nonStarted}>
            <div className={styles.bench}>
                <div className={styles.section}>
                    <h3>Bench</h3>
                    {ready.map(player => (
                        <p key={player.id} className={`${styles.player} ${styles.ready}`} onClick={() => onClick(player)}>
                            {player.jersey_number} {player.fullName}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default Bench;