import React, { useEffect, useState } from 'react';
import styles from './ContractRequest.module.css';

function ContractRequest({ person_id }) {
    const [newContractDue, setNewContractDue] = useState('');
    const [newSalary, setNewSalary] = useState('');
    const [selectedRequest, setSelectedRequest] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRequestById = async () => {
            setLoading(true)
            try {
                const response = await fetch(`http://localhost:5000/api/contractRequests/${person_id}`);
                if (!response.ok) {
                    throw new Error('Запрос не найден');
                }
                const data = await response.json();
        
                // Check if data is an object and wrap it in an array
                const requests = Array.isArray(data) ? data : [data];
                setSelectedRequest(requests);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false); // Stop loading
            }
        };
        fetchRequestById()  
    }, [person_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const requestData = { newContractDue, person_id, newSalary };

        try {
            const response = await fetch('http://localhost:5000/api/contractRequests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error('Не удалось отправить запрос');
            }
            setNewContractDue('');
            setNewSalary('');
        } catch (err) {
            setError(err.message);
        }
    };
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-En', options);
    };
    return (
        <div className={styles.contractRequest}>
            <h2>Contract Request</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>New Contract Due</label>
                    <input
                        type="date"
                        value={newContractDue}
                        onChange={(e) => setNewContractDue(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New salary</label>
                    <input
                        type="text"
                        value={newSalary}
                        onChange={(e) => setNewSalary(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className={styles.btnSubmit}>Send request</button>
            </form>

            <h3>Requests history</h3>
            {Array.isArray(selectedRequest) && selectedRequest.length > 0 ? (
                <ul className={styles.contractList}>
                    {selectedRequest.map((request) => (
                        <li key={request.contract_id}>
                            Request date: {formatDate(request.request_date)}, New Contract Due: {formatDate(request.new_contract_due)}, New salary: {request.new_salary}, Request salary: {request.can_update === null ? "Under consideration" : (request.can_update ? "Approved" : "Not Approved")}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No requests found.</p>
            )}

            {error && <div className="error-message">Error: {error}</div>}
        </div>
    );
}

export default ContractRequest;