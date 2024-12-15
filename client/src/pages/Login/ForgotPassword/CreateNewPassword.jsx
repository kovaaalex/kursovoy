import { useState } from "react";
import styles from '../login.module.css';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercase = 'abcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';
const minLength = 8, maxLength = 16;
const allChars = uppercase + lowercase + digits;

function generatePassword() {
    let length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let password = '';

    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];

    for (let index = 3; index < length; index++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password characters
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    return password;
}

function checkRegisterPassword(inputPassword) {
    const regex = /(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])/;
    return regex.test(inputPassword) && inputPassword.length >= 8 && inputPassword.length <= 16;
}

export default function CreateNewPassword({ email }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const navigate = useNavigate();

    const handleNewPasswordSubmit = async (e) => {
        e.preventDefault();
        if (repeatPassword !== password) {
            alert('Пароли не сопадают');
            return;
        }
        if (!isPasswordValid) {
            alert('Пароль не соответствует требованиям');
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/api/auth/newpassword', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                navigate('/account', { state: { user: data.user } });
            } else {
                alert('Invalid credentials');
            }
        } catch (error) {
            alert(`Ошибка при а ${error.message}`);
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setIsPasswordValid(checkRegisterPassword(newPassword)); // Validate password
    };

    const handleGeneratePasswordClick = () => {
        if (!password) {
            const generatedPassword = generatePassword();
            setPassword(generatedPassword);
            setRepeatPassword(generatedPassword);
            setIsPasswordValid(checkRegisterPassword(generatedPassword)); // Validate generated password
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleRepeatPasswordVisibility = () => {
        setShowRepeatPassword(!showRepeatPassword);
    };

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
                        onChange={handlePasswordChange}
                        onClick={handleGeneratePasswordClick}
                        className={`${styles.inputField} ${isPasswordValid ? styles.valid : styles.invalid}`} // Conditional styling
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
                        type={showRepeatPassword ? "text" : "password"} 
                        placeholder="Repeat Password"
                        value={repeatPassword}
                        onChange={(e) => setRepeatPassword(e.target.value)}
                        className={styles.inputField}
                        id="repeat__password" 
                    />
                    <FontAwesomeIcon 
                        icon={showRepeatPassword ? faEyeSlash : faEye} 
                        onClick={toggleRepeatPasswordVisibility} 
                        className={styles.passwordToggle} 
                        style={{ marginLeft: '-28px'}} 
                    />
                </div>
                <button type="submit" className={styles.submitButton} style={{ width: '216px' }}>Submit</button>
                <div className={styles.links}>
                    <a href="/login" className={styles.registerLink}>
                        Have already an account?
                    </a>
                </div>
            </div>
        </form>
    );
}