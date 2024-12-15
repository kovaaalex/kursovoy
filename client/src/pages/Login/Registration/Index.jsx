import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import styles from '../login.module.css';

export default function Registration() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const navigate = useNavigate();
    
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

        password = password.split('').sort(() => Math.random() - 0.5).join('');
        return password;
    }

    function checkRegisterPassword(inputPassword) {
        const regex = /(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])/;
        return regex.test(inputPassword) && inputPassword.length >= 8 && inputPassword.length <= 16;
    }

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        setIsPasswordValid(checkRegisterPassword(newPassword));
    };

    const handlePasswordClick = () => {
        if (!password) {
            const generatedPassword = generatePassword();
            setPassword(generatedPassword);
            setRepeatPassword(generatedPassword);
            setIsPasswordValid(checkRegisterPassword(generatedPassword));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (repeatPassword !== password) {
            alert('Пароли не сопадают');
            return;
        }
    
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
    
            if (response.ok) {
                alert(data.code)
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                localStorage.setItem('success', data.success);
                navigate('/enter-code', { state: { email, sentCode: data.code, user: data.user, success: data.success } });
            } else {
                alert(data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error("Ошибка при регистрации:", error);
            alert(`Ошибка при регистрации: ${error.message}`);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleRepeatPasswordVisibility = () => {
        setShowRepeatPassword(!showRepeatPassword);
    };

    return (
        <div className={styles.body__container}>
            <form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.login__container}>
                    <h3>Register here</h3>
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
                            onChange={handlePasswordChange}
                            onClick={handlePasswordClick}
                            className={`${styles.inputField} ${isPasswordValid ? styles.valid : styles.invalid}`}
                            id="password"
                        />
                        <FontAwesomeIcon
                            icon={showPassword ? faEyeSlash : faEye}
                            onClick={togglePasswordVisibility}
                            className={styles.passwordToggle}
                            style={{ marginLeft: '-28px' }}
                        />
                    </div>
                    <label htmlFor="repeatPassword">Repeat the password</label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type={showRepeatPassword ? "text" : "password"}
                            placeholder="Repeat Password"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                            className={styles.inputField}
                            id="repeatPassword"
                        />
                        <FontAwesomeIcon
                            icon={showRepeatPassword ? faEyeSlash : faEye}
                            onClick={toggleRepeatPasswordVisibility}
                            className={styles.passwordToggle}
                            style={{ marginLeft: '-28px' }}
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
    );
}