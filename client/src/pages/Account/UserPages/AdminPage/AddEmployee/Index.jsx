import { useState } from 'react';
import styles from './AddEmployee.module.css'; // Import your CSS styles

function AddEmployee() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [nationality, setNationality] = useState('');
    const [role, setRole] = useState('player'); // Default role
    const [email, setEmail] = useState('');
    const [contractUntil, setContractUntil] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Player specific fields
    const [playerNumber, setPlayerNumber] = useState('');
    const [position, setPosition] = useState('');

    // Coach specific fields
    const [coachRole, setCoachRole] = useState('main'); // Default coach role

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Simple validation
        if (!firstName || !lastName || !email) {
            setError("Please fill in all required fields.");
            return;
        }

        // Validate player number
        if (role === 'player') {
            const playerNum = parseInt(playerNumber);
            if (isNaN(playerNum) || playerNum < 1 || playerNum > 99) {
                setError("Player number must be between 1 and 99.");
                return;
            }
        }

        const payload = {
            firstName,
            lastName,
            dateOfBirth,
            nationality,
            role,
            email,
            contractUntil,
            ...(role === 'player' && { playerNumber, position }),
            ...(role === 'coach' && { coachRole }),
        };

        try {
            const response = await fetch('http://localhost:5000/api/addEmployee', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Failed to add employee.");
            }

            setSuccessMessage("Employee added successfully!");
            resetForm();
        } catch (error) {
            setError(error.message);
        }
    };

    const resetForm = () => {
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
        setNationality('');
        setRole('player');
        setEmail('');
        setContractUntil('');
        setPlayerNumber('');
        setPosition('');
        setCoachRole('main');
        setError('');
        setSuccessMessage('');
    };

    return (
        <div className={styles.AddEmployee}>
            <h2>Add Employee</h2>
            {error && <div className={styles.error}>{error}</div>}
            {successMessage && <div className={styles.success}>{successMessage}</div>}
            <form onSubmit={handleSubmit}>
                <div className={styles.inlineFields}>
                    <div>
                        <label>First Name:</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Last Name:</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Date of Birth:</label>
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Nationality:</label>
                        <input
                            type="text"
                            value={nationality}
                            onChange={(e) => setNationality(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>Contract Until:</label>
                        <input
                            type="date"
                            value={contractUntil}
                            onChange={(e) => setContractUntil(e.target.value)}
                        />
                    </div>
                </div>
                
                <div>
                    <label>Role:</label>
                    <div className={styles.roleContainer}>
                        {['player', 'coach', 'medic'].map((option) => (
                            <div
                                key={option}
                                className={`${styles.roleOption} ${role === option ? styles.selected : ''}`}
                                onClick={() => {
                                    setRole(option);
                                    if (option !== 'player') {
                                        setPlayerNumber('');
                                        setPosition('');
                                    }
                                    if (option !== 'coach') {
                                        setCoachRole('main');
                                    }
                                }}
                            >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </div>
                        ))}
                    </div>
                </div>
                
                {role === 'player' && (
                    <>
                        <div>
                            <label>Player Number:</label>
                            <input
                                type="number"
                                value={playerNumber}
                                onChange={(e) => setPlayerNumber(e.target.value)}
                                required
                                min="1"
                                max="99"
                                placeholder="1-99"
                            />
                        </div>
                        <div>
                            <label>Position:</label>
                            <div className={styles.roleContainer}>
                                {['Defender', 'Goalkeeper', 'Midfielder', 'Forward'].map((option) => (
                                    <div
                                        key={option}
                                        className={`${styles.roleOption} ${position === option ? styles.selected : ''}`}
                                        onClick={() => setPosition(option)}
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                
                {role === 'coach' && (
                    <div>
                        <label>Coach Role:</label>
                        <div className={styles.roleContainer}>
                            {['main', 'assistant'].map((option) => (
                                <div
                                    key={option}
                                    className={`${styles.roleOption} ${coachRole === option ? styles.selected : ''}`}
                                    onClick={() => setCoachRole(option)}
                                >
                                    {option.charAt(0).toUpperCase() + option.slice(1)} Coach
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button type="submit">Add Employee</button>
            </form>
        </div>
    );
}

export default AddEmployee;