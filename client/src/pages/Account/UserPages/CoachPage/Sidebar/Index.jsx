import styles from './Sidebar.module.css'
function Sidebar({ onItemClick, role }){
    return(
        <aside className={styles.aside}>
            <ul>
                <li onClick={() => onItemClick('home')}>Home</li>
                {
                    role === 'main' ? 
                    (   
                        <li onClick={() => onItemClick('squad')}>Choose squad</li>
                    ) : (
                        <li onClick={() => onItemClick('setStats')}>Set Stats</li>
                    )
                }
                <li onClick={() => onItemClick('requestContract')}>Request Contract</li>
                <li onClick={() => onItemClick('logout')}>Log out</li>
            </ul>
        </aside>
    )
}
export default Sidebar