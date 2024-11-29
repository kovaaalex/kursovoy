import { useLocation } from "react-router-dom";
import { UserPage } from './UserPages/UserPage/Index'
import CoachPage from "./UserPages/CoachPage/CoachPage";
import styles from './Account.module.css'
import MedicPage from "./UserPages/MedicPage/Index";
function Account() {
    const location = useLocation();
    console.log('Location state:', location.state)
    const { user } = location.state || {}
    const defaultPhotoUrl = '/images/default-avatar.png'
    const photoUrl = user && user.picture ? `/images/${user.picture}` : defaultPhotoUrl
    if(!user) {
        return <p>Loading...</p>
    }
    const renderUserRole = () => {
        switch (user.person_role) {
            case 'player':
                return (<UserPage user={user} photoUrl={photoUrl}></UserPage>)
                case 'coach':
                    return (
                        <CoachPage user={user} photoUrl={photoUrl}></CoachPage>
                    )
                case 'medic':
                    return (
                        <MedicPage user={user} photoUrl={photoUrl}/>
                    );
                case 'fan':
                    return (
                        <div>
                            <h2>Fan Area</h2>
                            <p>OLE OLE OLE OLE</p>
                            {/* Здесь добавьте компоненты для медика */}
                        </div>
                    );
                case 'admin':
                    return (
                        <div>
                            <h2>Admin Panel</h2>
                            <p>Manage users and settings.</p>
                            {/* Здесь добавьте компоненты для администратора */}
                        </div>
                    )
            default:
                return <p>
                    {alert(Object.keys(user))}
                    Unknown role. Please contact support.</p>
        }
    }
    return (
        <>{renderUserRole()}</>
            
    )
}

export default Account;
