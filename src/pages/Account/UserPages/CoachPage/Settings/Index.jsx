import { useState, useEffect } from "react"

function Settings() {
    const [person, setPerson] = useState({});

    useEffect(() => {
        // Получение данных пользователя из localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setPerson(JSON.parse(userData));
        }
    }, []);

    return (
        <div>
            <h2>Settings</h2>
            <div>
                <p>Name: {person.first_name} {person.last_name}</p>
                <p>Email: {person.email}</p>
                {/* Добавьте другие поля для настроек */}
            </div>
            {/* {<button onClick={handleSaveSettings}>Save Settings</button>} */}
        </div>
    )
}

export default Settings