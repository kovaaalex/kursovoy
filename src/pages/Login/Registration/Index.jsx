import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from '../login.module.css'
export default function Registration() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeat__password, setRepeatPassword] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        if(repeat__password !== password) {
            alert('Пароли не сопадают')
            return
        }
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, birth_date: birthDate })
            })
            const data = await response.json()
            if (response.ok) {
                alert(data.user)
                navigate('/account', { state: { user: data.user } })
            } else {
                alert('Invalid credentials')
            }
        } catch (error) {
            alert(`Ошибка при а ${error.message}`)
        }
    }
    const togglePasswordVisibility = (e) => {
        setShowPassword(!showPassword)
    }
    return (
        <div className={styles.body__container}>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.login__container}>
                    <h3>Register here</h3>
                    <label htmlFor="firstName">First Name</label>
                    <input 
                        type="text"
                        placeholder="Enter first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className={styles.inputField}
                        id="firstName" 
                    />
                    <label htmlFor="lastName">Last Name</label>
                    <input 
                        type="text"
                        placeholder="Enter last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className={styles.inputField}
                        id="lastName" 
                    />
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.inputField}
                        id="email" 
                    />
                    <label htmlFor="birthDate">Birth Date</label>
                    <input 
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        className={styles.inputField}
                        id="birthDate" 
                    />
                    <label htmlFor="password">Password</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={styles.inputField}
                            id="password" 
                        />
                        <FontAwesomeIcon 
                            icon={showPassword ? faEyeSlash : faEye} 
                            onClick={togglePasswordVisibility} 
                            className={styles.passwordToggle} 
                            style={{ marginLeft: '-28px'}} 
                        />
                    </div>
                    <label htmlFor="repeat__password">Repeat the password</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Repeat Password"
                            value={repeat__password} // Это поле должно быть отдельно от пароля
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            className={styles.inputField}
                            id="repeat__password" 
                        />
                        <FontAwesomeIcon 
                            icon={showPassword ? faEyeSlash : faEye} 
                            onClick={togglePasswordVisibility} 
                            className={styles.passwordToggle} 
                            style={{ marginLeft: '-28px'}} 
                        />
                    </div>
                    <button type="submit" className={styles.submitButton}>Submit</button>
                    <div className={styles.links}>
                        <a href="/login" className={styles.registerLink}>
                            Have already an account?
                        </a>
                    </div>
                </div>
            </form>
        </div>
    )
}