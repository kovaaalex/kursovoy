import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from '../login.module.css';

export default function EnterCode() {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, sentCode, user } = location.state || {}
    const [code, setCode] = useState('');

    const handleCodeSubmit = (e) => {
        e.preventDefault();
        console.log('Entered code:', code);
        console.log('Sent code:', sentCode);
        if (code === sentCode) {

            localStorage.setItem('success', 'true');
            navigate('/account', { state: { email, user } });
        } else {
            alert('Некорректный код. Пожалуйста, попробуйте снова.');
        }
    };

    return (
        <div className={styles.body__container}>
            <form onSubmit={handleCodeSubmit} className={styles.formContainer}>
                <div className={styles.login__container}>
                    <h3>Enter the 6-digit code sent to your email.</h3>
                    <label htmlFor="code">Code</label>
                    <input 
                        type="text"
                        placeholder="Enter code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        className={styles.inputField}
                        id="code" 
                    />
                    <button type="submit" className={styles.submitButton}>Check code</button>
                </div>
            </form>
        </div>
    );
}