import styles from './Sidebar.module.css'
function Sidebar({ onItemClick }){
    return(
        <aside className={styles.aside}>
            <ul>
                <li onClick={() => onItemClick('squad')}>Choose squad</li>
                <li onClick={() => onItemClick('requestPlayers')}>Request players</li>
                <li onClick={() => onItemClick('requestContract')}>Request Contract</li>
                <li onClick={() => onItemClick('settings')}>Settings</li>
                <li onClick={() => onItemClick('logout')}>Log out</li>
            </ul>
        </aside>
    )
}
export default Sidebar