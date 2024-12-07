import { useState } from "react";
import styles from '../login.module.css';
import EnterCode from "./EnterCode";
function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isEmailSubmitted, setEmailSubmitted] = useState(false);
    const [sentCode, setSentCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEmailSubmitted(true);
        
        try {
            const response = await fetch('http://localhost:5000/api/forgot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            const data = await response.json();
            console.log('Success:', data);
            setSentCode(data.code); // Store the sent code for later verification
        } catch (error) {
            console.error('Error:', error);
            // Optionally, you can show an error message to the user
        }
    };

    return (
        <div className={styles.body__container}>
            

            {isEmailSubmitted ? 
                (<EnterCode email = {email} sentCode = {sentCode}></EnterCode>) : (<form onSubmit={handleSubmit} className={styles.formContainer}>
                <div className={styles.login__container}>
                    <h3>Enter Email</h3>
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
                    <button type="submit" className={styles.submitButton}>Submit</button>
                </div>
            </form>)
            }
        </div>
    );
}

export default ForgotPassword;