import styles from '../match.module.css'
export default function MatchTime({date}) {
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const matchDate = new Date(date.toString())

    function separateDayOfWeek(){
        const dayOfWeek = daysName[matchDate.getDay()]
        return `${dayOfWeek}`
    }
    function separateDay(){
        const dayOfWeek = daysName[matchDate.getDay()]
        const monthOfYear = monthName[matchDate.getMonth()]
        return `${matchDate.getDate()} ${monthOfYear} ${matchDate.getFullYear()}`
    }
    function separateTime(){
        return `${matchDate.getHours()}:${matchDate.getMinutes() === 0 ? '00' : matchDate.getMinutes()}`
    }
    return (
        <div className={styles.timestamp}>
            <div className={styles.dayOfMatch}>
                <p>{separateDayOfWeek()}</p>
                <p>{separateDay()}</p>
            </div>
            <div className={styles.dayOfMatch}>
                <p>{separateTime()}</p>
            </div>
        </div>
    )
}