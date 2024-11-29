import React, { useState } from 'react';
import Squad from './Squad/Index';
import Sidebar from './Sidebar/Index';
import RequestPlayers from './RequestPlayers/Index';
import Settings from './Settings/Index';
import ContractRequest from './ContractRequest/Index';
import styles from './Coach.module.css'
import Account from '../../Account';

import { useNavigate } from 'react-router-dom'

function CoachPage({user, photoUrl}) {
    const navigate = useNavigate()
    const [selectedTab, setSelectedTab] = useState('squad');

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
    return (
        <div className={styles.coachpage}>
            <Sidebar onItemClick={handleSidebarItemClick} />
            <div className={styles.accountmain}>
                <div>
                    <h1>Welcome to your Personal Account</h1>
                    <div>
                        <p>Name: {user.first_name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <img src={photoUrl} alt={user.first_name} style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
                    </div>
                </div>
                {selectedTab === 'squad' && <Squad />}
                {selectedTab === 'requestPlayers' && <RequestPlayers />}
                {selectedTab === 'requestContract' && <ContractRequest />}
                {selectedTab === 'settings' && <Settings />}
            </div>
        </div>
    );
}

export default CoachPage;