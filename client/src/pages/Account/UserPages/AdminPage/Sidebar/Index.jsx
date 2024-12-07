import styles from './Sidebar.module.css'
function Sidebar({ onItemClick }){
    return(
        <aside className={styles.aside}>
            <ul>
                <li onClick={() => onItemClick('home')}>Home</li>
                <li onClick={() => onItemClick('squad')}>Get squads</li>
                <li onClick={() => onItemClick('requestContract')}>Check Contract Requests</li>
                <li onClick={() => onItemClick('addPerson')}>Add Employer</li>
                <li onClick={() => onItemClick('deletePerson')}>Delete Employer</li>
                <li onClick={() => onItemClick('logout')}>Log out</li>
            </ul>
        </aside>
    )
}
export default Sidebar