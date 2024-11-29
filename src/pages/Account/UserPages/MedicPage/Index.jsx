import { useState } from "react";
import {useNavigate} from 'react-router-dom'
import Permissions from "./Permissions/Index";
import Sidebar from "./Sidebar/Index";
import styles from './MedicPage.module.css'
import AddInjury from "./AddInjury/Index";
function MedicPage({user, photoUrl}) {
    const [selectedTab, setSelectedTab] = useState('permissions');
    const navigate = useNavigate()
    const handleSidebarItemClick = (tab) => {
        if (tab === 'logout') {
            handleLogout();
        } else {
            setSelectedTab(tab);
        }
    }
    const handleLogout = () => {
        // Очистка всех данных пользователя
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('photoUrl');
        // Перенаправление на страницу входа
        navigate('/login');
    }
    return(
        <div className={styles.medicpage}>
            <Sidebar onItemClick={handleSidebarItemClick}/>
            <div>
                <div>
                    <h1>Welcome to your Personal Account</h1>
                    <div>
                        <p>Name: {user.first_name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <img src={photoUrl} alt={user.first_name} style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
                    </div>
                </div>
                {selectedTab === 'permissions' && <Permissions />}
                {selectedTab === 'addInjury' && <AddInjury />}
            </div>
        </div>
    )
}
export default MedicPage