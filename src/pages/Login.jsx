import { useState, useEffect } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [users, setUsers] = useState([])
    
    useEffect(() => {
        fetch('./data/users.json')
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error('Error loading users:', error))
    }, [])
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
            if(response.ok) {
                alert('Success')
                alert(`Роль пользователя: ${data.role}`)
            }
            else alert('Ты инвалид')
        } catch (error) {
            alert(`Ошибка при а ${error.message}`)
        }
    }
    const togglePasswordVisibility = (e) => {
        setShowPassword(!showPassword)
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <input 
                type="email"
                placeholder="Enter email"
                value = {email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            <input 
                type={showPassword ? "text" : "password"} 
                name="" 
                id="" 
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
                <FontAwesomeIcon 
                            icon={showPassword ? faEyeSlash : faEye} 
                            onClick={togglePasswordVisibility} 
                            style={{ marginLeft: '8px', cursor: 'pointer' }} 
                        />
            <button type="submit">Submit</button>
        </form>
    )
}
export default Login
