import styles from './PersonInfo.module.css'
function PersonInfo({user, photoUrl}) {
    return(
        <div className={styles.personInfo}>
            <img src={photoUrl} alt={user.first_name} style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
            <div className={styles.personHeaders}>
                <h1>{user.first_name} {user.last_name}</h1>
                <h3>{user.person_role}</h3>
                <h5>{user.email}</h5>
            </div>
        </div>
    )
}
export default PersonInfo