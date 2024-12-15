import { useState, useEffect } from "react";
import styles from './CheckContractRequests.module.css';

function ContractRequest() {
    const [contracts, setContracts] = useState([]);
    const [archiveContracts, setArchiveContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updateChoice, setUpdateChoice] = useState(null);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/contracts/requests');
                if (!response.ok) {
                    throw new Error("Network response was not okay");
                }
                const data = await response.json();
                const filteredContracts = data.filter(contract => contract.can_update === null);
                const archive = data.filter(contract => contract.can_update !== null);
                setContracts(filteredContracts);
                setArchiveContracts(archive);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchContracts();
    }, []);

    const handleUpdateChoiceChange = (e) => {
        setUpdateChoice(e.target.value === 'true');
    };

    const handleProcessContracts = async (contract_id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/contracts/requests/${contract_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_updated: updateChoice }),
            });

            if (!response.ok) {
                throw new Error(`Could not process contract with ID ${contract_id}`);
            }

            const updatedContracts = await fetch('http://localhost:5000/api/contracts/requests');
            const data = await updatedContracts.json();
            const filteredContracts = data.filter(contract => contract.can_update === null);
            const archive = data.filter(contract => contract.can_update !== null);
            setContracts(filteredContracts);
            setArchiveContracts(archive);
        } catch (error) {
            setError(error.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date)) {
            return 'Invalid date';
        }
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.checkContractRequests}>
            <h2>Contract Requests</h2>
            <div className={styles.table}>
                <div className={styles.row}>
                    <div className={styles.header}>Name</div>
                    <div className={styles.header}>Request Date</div>
                    <div className={styles.header}>New Contract Due</div>
                    <div className={styles.header}>New Salary</div>
                    <div className={styles.header}>Actions</div>
                </div>
                {contracts.map((contract) => (
                    <div className={styles.row} key={contract.contract_id}>
                        <div>{contract.name}</div>
                        <div>{formatDate(contract.request_date)}</div>
                        <div>{formatDate(contract.new_contract_due)}</div>
                        <div>${contract.new_salary.toLocaleString()}</div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    value="true"
                                    checked={updateChoice === true}
                                    onChange={handleUpdateChoiceChange}
                                />
                                Update Contract
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="false"
                                    checked={updateChoice === false}
                                    onChange={handleUpdateChoiceChange}
                                />
                                Send to Archive
                            </label>
                            <button onClick={() => handleProcessContracts(contract.contract_id)} className={styles.updateContract}>Process</button>
                        </div>
                    </div>
                ))}
            </div>

            <h2>Archived Contracts</h2>
            <div className={styles.table}>
                <div className={styles.row}>
                    <div className={styles.header}>Name</div>
                    <div className={styles.header}>Updated On</div>
                    <div className={styles.header}>New Contract Due</div>
                    <div className={styles.header}>Salary</div>
                    <div className={styles.header}>Approved</div>
                </div>
                {archiveContracts.map((contract) => (
                    <div className={styles.row} key={contract.contract_id}>
                        <div>{contract.name}</div>
                        <div>{formatDate(contract.request_date)}</div>
                        <div>{formatDate(contract.new_contract_due)}</div>
                        <div>${contract.new_salary.toLocaleString()}</div>
                        <div>{contract.can_update ? "Yes" : "No"}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ContractRequest;