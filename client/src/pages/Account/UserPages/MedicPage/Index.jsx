import { useState } from "react";
import {useNavigate} from 'react-router-dom'
import Permissions from "./Permissions/Index";
import Sidebar from "./Sidebar/Index";
import styles from './MedicPage.module.css'
import AddInjury from "./AddInjury/Index";
import PersonInfo from "../../Components/PersonInfo/Index";
import ContractRequest from '../../Components/ContractRequest/Index';
import InjuryHistory from "./InjuryHistory/Index";
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
            <PersonInfo user={user} photoUrl={photoUrl} />
            <>
                {selectedTab === 'permissions' && <Permissions />}
                {selectedTab === 'requestContract' && <ContractRequest person_id={user.id}/>}
                {selectedTab === 'injuryHistory' && <InjuryHistory/>}
                {selectedTab === 'addInjury' && <AddInjury />}
            </>
            </div>
        </div>
    )
}
export default MedicPage