import { useLocation } from "react-router-dom";
import CoachPage from "./UserPages/CoachPage/Index";
import styles from './Account.module.css'
import MedicPage from "./UserPages/MedicPage/Index";
import AdminPage from "./UserPages/AdminPage/Index";
import PlayerPage from "./UserPages/PlayerPage/Index";
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
                    return (
                        <PlayerPage user={user} photoUrl={photoUrl}></PlayerPage>
                    )
                case 'coach':
                    return (
                        <CoachPage user={user} photoUrl={photoUrl}></CoachPage>
                    )
                case 'medic':
                    return (
                        <MedicPage user={user} photoUrl={photoUrl}/>
                    );
                case 'admin':
                    return (
                        <AdminPage user={user} photoUrl={photoUrl}/>
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
