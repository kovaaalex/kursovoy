import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar/Index";
import FileDownloader from "../../Components/FileDownloader/Index";
import ContractRequest from "./CheckContractRequests/Index";
import styles from './AdminPage.module.css'
import PersonInfo from "../../Components/PersonInfo/Index";
import AddEmployee from "./AddEmployee/Index";
import DeleteEmployee from "./DeleteEmployee/Index";
function AdminPage({user, photoUrl}) {
    const navigate = useNavigate()
    const [selectedTab, setSelectedTab] = useState('squad');

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
        localStorage.removeItem('success')
        // Перенаправление на страницу входа
        navigate('/login');
    }
    return(
        <div className={styles.adminmain}>
            <Sidebar onItemClick={handleSidebarItemClick} />
            <div className={styles.accountmain}>
                <PersonInfo user={user} photoUrl={photoUrl}/>
                {selectedTab === 'squad' && <FileDownloader />}
                {selectedTab === 'requestContract' && <ContractRequest />}
                {selectedTab === 'deletePerson' && <DeleteEmployee />}
                {selectedTab === 'addPerson' && <AddEmployee />}
            </div>
        </div>
    )
}
export default AdminPage