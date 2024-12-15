import styles from './Sidebar.module.css'
function Sidebar({ onItemClick }){
    return(
        <aside className={styles.aside}>
            <ul>
                <li onClick={() => onItemClick('home')}>Home</li>
                <li onClick={() => onItemClick('playerInfo')}>Player Info</li>
                <li onClick={() => onItemClick('requestContract')}>Contract Requests</li>
                <li onClick={() => onItemClick('logout')}>Log out</li>
            </ul>
        </aside>
    )
}
export default Sidebar