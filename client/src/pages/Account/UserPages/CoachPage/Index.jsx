import React, { useState, useEffect } from 'react';
import Squad from './Squad/Index';
import Sidebar from './Sidebar/Index';
import ContractRequest from '../../Components/ContractRequest/Index';
import styles from './Coach.module.css'
import SetStats from './SetStats/Index';
import PersonInfo from './../../Components/PersonInfo/Index'
import { useNavigate } from 'react-router-dom'
function CoachPage({user, photoUrl}) {
    const navigate = useNavigate()
    const [coachRole, setCoachRole] = useState('');
    const [selectedTab, setSelectedTab] = useState('');
    useEffect(() => {
        const getCoaches = async() => {
            try {
                const response = await fetch(`http://localhost:5000/api/coaches/${user.id}`)
                if(!response.ok) {
                    throw new Error('Invalid id')
                }
                const data = await response.json()
                const role = data[0].role
                setSelectedTab(role === 'main' ? 'squad' : 'setStats')
                setCoachRole(role)
            } catch (error) {
                alert('Ty pidor')
                console.error('Ty pidor')
            }
        }
        getCoaches()
    }, [user.id])
    const handleSidebarItemClick = (tab) => {
        if(tab === 'home') {
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
    return (
        <>
            <div className={styles.coachpage}>
                <Sidebar onItemClick={handleSidebarItemClick} role={coachRole}/>
                <div className={styles.accountmain}>
                    <PersonInfo user={user} photoUrl={photoUrl}/>
                    {selectedTab === 'squad' && <Squad />}
                    {selectedTab === 'requestContract' && <ContractRequest person_id={user.id}/>}
                    {selectedTab === 'setStats' && <SetStats person_id={user.id}/>}
                </div>
            </div>
        </>
    );
}

export default CoachPage;