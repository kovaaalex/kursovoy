import { useLocation } from "react-router-dom";
import { UserPage } from './UserPages/UserPage'
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
                return (<UserPage></UserPage>)
                case 'coach':
                    return (
                        <div>
                            <h2>Coach Dashboard</h2>
                            <p>Manage your team and schedule.</p>
                            {/* Здесь добавьте компоненты для тренера */}
                        </div>
                    )
                case 'medic':
                    return (
                        <div>
                            <h2>Medic Area</h2>
                            <p>Access medical records and reports.</p>
                            {/* Здесь добавьте компоненты для медика */}
                        </div>
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
                return <p>Unknown role. Please contact support.</p>
        }
    }
    return (
        <div>
            <h1>Welcome to your Personal Account</h1>
            <div>
                <p>Name: {user.first_name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <img src={photoUrl} alt={user.first_name} style={{ borderRadius: '50%', width: '100px', height: '100px' }} />
            </div>
            {renderUserRole()}
        </div>
    )
}

export default Account;
