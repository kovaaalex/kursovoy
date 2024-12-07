import { useState } from 'react';
import styles from '../login.module.css';
import CreateNewPassword from './CreateNewPassword';
export default function EnterCode({email, sentCode}) {
    const [code, setCode] = useState('');
    const [isCodeSented, setCodeSented] = useState(false)
    const handleCodeSubmit = (e) => {
        e.preventDefault();
        
        alert(code)
        alert(sentCode)
        if (code === sentCode) {
            alert('Code is correct! You can proceed.');
            setCodeSented(true)
            // Here you can redirect the user or handle the next steps
        } else {
            alert('Incorrect code. Please try again.');
        }
    };
    return (
        <>{isCodeSented ? (<CreateNewPassword email = {email}></CreateNewPassword>) :
            (<form onSubmit={handleCodeSubmit} className={styles.formContainer}>
                <div className={styles.login__container}>
                    <h3>Enter the 6-Digit Code Sent to Your Email</h3>
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
                    <button type="submit" className={styles.submitButton}>Verify Code</button>
                </div>
            </form>) }
        </>
    )
}