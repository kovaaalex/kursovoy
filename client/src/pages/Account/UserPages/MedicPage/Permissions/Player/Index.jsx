import styles from './Player.module.css';

function Player({ playerId, name, is_injured, number, onChange }) {
    const handleChange = (event) => {
        const selectedValue = event.target.value === 'true'; // Получаем значение из выбранной радио-кнопки
        onChange(selectedValue); // Вызываем onChange с выбранным значением
    };

    return (
        <div className={styles.player}>
            <p>{name} {number}</p>
            <div className={styles.radioGroup}>
                <input
                    type="radio"
                    name={`give_permission_${playerId}`}
                    id={`ready_${playerId}`}
                    value="false" // Ready is false
                    checked={is_injured === false} // Проверяем, если игрок не травмирован
                    onChange={handleChange}
                    className={styles.radioInput}
                />
                <label htmlFor={`ready_${playerId}`} className={styles.radioLabel}>Ready</label>

                <input
                    type="radio"
                    name={`give_permission_${playerId}`}
                    id={`is_injured_${playerId}`}
                    value="true" // Injured is true
                    checked={is_injured === true} // Проверяем, если игрок травмирован
                    onChange={handleChange}
                    className={styles.radioInput}
                />
                <label htmlFor={`is_injured_${playerId}`} className={styles.radioLabel}>Injured</label>
            </div>
        </div>
    );
}

export default Player;