import Sidebar from "./Settings/Index"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ContractRequest from "../../Components/ContractRequest/Index";
import PersonInfo from "../../Components/PersonInfo/Index";
import styles from './PlayerPage.module.css'
import PlayerInfo from "./PlayerInfo/Index";
function PlayerPage({user, photoUrl}) {
    const navigate = useNavigate()
    const [selectedTab, setSelectedTab] = useState('requestContract');

    const handleSidebarItemClick = (tab) => {
        alert(user.id)
        if (tab === 'home') {
            navigate('/')
        }
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
        <div className={styles.playerPages}>
            <Sidebar onItemClick={handleSidebarItemClick} />
            <div className={styles.accountmain}>
                <PersonInfo user={user} photoUrl={photoUrl}/>
                {selectedTab === 'requestContract' && <ContractRequest />}
                {selectedTab === 'playerInfo' && <PlayerInfo />}
            </div>
        </div>
    )
}
export default PlayerPage