import { useState, useEffect } from "react";
import styles from './DeleteEmployee.module.css';

function DeleteEmployee() {
    const [employeeId, setEmployeeId] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState(null)
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/employees");
                if (!response.ok) {
                    throw new Error("Failed to fetch employees.");
                }
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchEmployees();
    }, []);

    // Get unique roles from employees
    const uniqueRoles = [...new Set(employees.map(emp => emp.person_role))];

    // Get characters based on the selected role
    const filteredCharacters = selectedRole 
        ? employees.filter(emp => emp.person_role === selectedRole) 
        : [];

        const handleDelete = async () => {
            setMessage('');
            setError('');
        
            // Используем selectedPerson.id вместо employeeId
            const idToDelete = selectedPerson ? selectedPerson.id : null;
        
            if (!idToDelete) {
                setError("No employee selected.");
                return;
            }
        
            try {
                const response = await fetch(`http://localhost:5000/api/employees/delete/${idToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
        
                if (!response.ok) {
                    throw new Error("Failed to delete employee.");
                }
        
                const data = await response.json();
                setMessage(data.message);
        
                // Обновляем список сотрудников
                const updatedEmployees = employees.filter(emp => emp.id !== idToDelete);
                setEmployees(updatedEmployees);
                setSelectedPerson(null); // сбрасываем выбранного человека
            } catch (error) {
                setError(error.message);
            }
        };

    return (
        <div className={styles.deleteEmployee}>
            <h2>Delete Employee</h2>
            {message && <div className={styles.successMessage}>{message}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <h3>Select Role and Character</h3>
            <div>                
                    <div>
                    <label>Role:</label>
                    <div className={styles.roleContainer}>
                        {['player', 'coach', 'medic'].map((option) => (
                            <div
                                key={option}
                                className={`${styles.roleOption} ${selectedRole === option ? styles.selected : ''}`}
                                onClick={() => {
                                    setSelectedRole(option);
                                }}
                            >
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </div>
                        ))}
                    </div>
                </div>
                
            </div>
            
            <div>
                <h4>Characters: {selectedPerson ? selectedPerson.name : ""}</h4>
                {isRoleDropdownOpen && (

                <div className={styles.characters}>
                    {filteredCharacters.map(character => (
                        <div
                            key={character.id}
                            className={styles.character}
                            onClick={() => {setSelectedPerson(character)
                                alert(character.id)
                                setIsRoleDropdownOpen(false)
                            }}
                        >
                            {character.name}
                        </div>
                    ))}
                </div>
                )}
            </div>
            <button onClick={handleDelete}>Delete Employee</button>
        </div>
    );
}

export default DeleteEmployee;