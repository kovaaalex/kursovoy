import { useState } from "react";
import styles from '../login.module.css'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
export default function CreateNewPassword({email}) {
    
    const [showPassword, setShowPassword] = useState(false)
    const [password, setPassword] = useState('');
    const [repeat__password, setRepeatPassword] = useState('');
    const navigate = useNavigate()

    const handleNewPasswordSubmit = async (e) => {
        if(repeat__password !== password) {
            alert('Пароли не сопадают')
            return
        }
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:5000/api/newpassword', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            alert(data.user)
            if (response.ok) {
                alert(data.message)
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
            <form onSubmit={handleNewPasswordSubmit} className={styles.formContainer}>
                <div className={styles.login__container}>
                    <h3>Create new password</h3>
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
    )
}