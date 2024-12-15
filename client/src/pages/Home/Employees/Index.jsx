import { useState, useEffect } from "react";
import styles from './Employees.module.css';

function Employee() {
    const [employees, setEmployees] = useState([]);

    useEffect(() => {
        const getOtherEmployees = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/employees/other');
                if (!response.ok) {
                    throw new Error('Error');
                }
                const data = await response.json();
                setEmployees(data);
            } catch (error) {
                console.error(error.message);
            }
        };
        getOtherEmployees();
    }, []);

    return (
        <div className={styles.employees}>
            <h3>Coaching staff, medics and administration</h3>
            <div className={styles.container}>
                <div className={styles.header}>
                    <div>Name</div>
                    <div>Role</div>
                </div>
                <div className={styles.body}>
                    {employees.length > 0 ? (
                        employees.map((employee) => (
                            <div className={styles.row} key={employee.id}>
                                <div>{employee.name}</div>
                                <div>{employee.person_role}</div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.row}>
                            <div colSpan="2">No employees found</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Employee;