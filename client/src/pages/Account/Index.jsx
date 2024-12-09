import { useLocation } from "react-router-dom";
import CoachPage from "./UserPages/CoachPage/Index";
import styles from './Account.module.css';
import MedicPage from "./UserPages/MedicPage/Index";
import AdminPage from "./UserPages/AdminPage/Index";
import PlayerPage from "./UserPages/PlayerPage/Index";

function Account() {
    const location = useLocation();
    console.log('Location state:', location.state);
    const savedUser = localStorage.getItem('user');
    let user;
    if (savedUser) {
        try {
            user = JSON.parse(savedUser);
            console.log('User object:', user)
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    } else {
        console.log('No user data found in localStorage');
    }

    const defaultPhotoUrl = '/images/default-avatar.png';
    const photoUrl = (user && user.picture) ? `/images/${user.picture}` : defaultPhotoUrl;

    if (!user) {
        return <p>Loading...</p>;
    }

    const renderUserRole = () => {
        alert(user.person_role);

        switch (user.person_role) {
            case 'player':
                return <PlayerPage user={user} photoUrl={photoUrl} />;
            case 'coach':
                return <CoachPage user={user} photoUrl={photoUrl} />;
            case 'medic':
                return <MedicPage user={user} photoUrl={photoUrl} />;
            case 'admin':
                return <AdminPage user={user} photoUrl={photoUrl} />;
            default:
                alert('Unknown role');
                return <p>Unknown role. Please contact support.</p>;
        }
    };

    return <>{renderUserRole()}</>;
}

export default Account;