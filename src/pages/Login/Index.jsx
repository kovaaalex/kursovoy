import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import {useNavigate, Navigate} from 'react-router-dom'
import styles from './login.module.css'
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [users, setUsers] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        const token = localStorage.getItem('token')
        const savedUser = localStorage.getItem('user');
        const user = savedUser ? JSON.parse(savedUser) : null
        if(token) {
            navigate('/account', { state: { user } })
        }
    }, [navigate])
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })
            const data = await response.json()
            if (response.ok) {
                alert(data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                alert(localStorage.getItem('user')[0])
                setUsers(data.user)
                localStorage.setItem('token', data.token)
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
            <h3>Login here</h3>
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
            <button type="submit" className={styles.submitButton}>Submit</button>
            <div className={styles.links}>
                <a href="/register" className={styles.registerLink}>
                    Register
                </a>
                <a href="/forgot" className={styles.forgot}>
                    Forgot password
                </a>
            </div>
            </div>
        </form>
        </div>
    )
}
export default Login
