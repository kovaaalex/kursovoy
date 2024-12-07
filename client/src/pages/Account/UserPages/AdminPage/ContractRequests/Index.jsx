import { useState, useEffect } from "react";

function ContractRequest() {
    const [contracts, setContracts] = useState([]);
    const [archiveContracts, setArchiveContracts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updateChoice, setUpdateChoice] = useState(null);

    useEffect(() => {
        const fetchContracts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/contract-requests');
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
            alert(contract_id)
            const response = await fetch(`http://localhost:5000/api/contract-requests/${contract_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_updated: updateChoice }),
            });

            if (!response.ok) {
                throw new Error(`Не удалось обработать контракт с ID ${contract_id}`);
            }

            // Обновляем список контрактов после обработки
            const updatedContracts = await fetch('http://localhost:5000/api/contract-requests');
            const data = await updatedContracts.json();
            const filteredContracts = data.filter(contract => contract.can_update === null);
            const archive = data.filter(contract => contract.can_update !== null);
            setContracts(filteredContracts);
            setArchiveContracts(archive)
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Просьба рассмотреть контракты</h2>
            <div>
                {contracts.map((contract) => (
                    <div key={contract.contract_id}> {/* Добавляем уникальный ключ */}
                        <span>{contract.name}</span>
                        <span>{contract.new_contract_due}</span>
                        <span>{contract.new_salary}</span>
                        <span>{contract.request_date}</span>
                        <label>
                            <input
                                type="radio"
                                value="true"
                                checked={updateChoice === true}
                                onChange={handleUpdateChoiceChange}
                            />
                            Обновить контракт
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="false"
                                checked={updateChoice === false}
                                onChange={handleUpdateChoiceChange}
                            />
                            Отправить в архив
                        </label>
                        <button onClick={() => handleProcessContracts(contract.contract_id)}>Обработать контракт</button> {/* Используем стрелочную функцию */}
                    </div>
                ))}
            </div>
            <h2>В архиве</h2>
            <div>
                {archiveContracts.map((contract) => (
                    <div key={contract.contract_id}> {/* Добавляем уникальный ключ */}
                        <span>{contract.name}</span>
                        <span>{contract.new_contract_due}</span>
                        <span>{contract.new_salary}</span>
                        <span>{contract.request_date}</span>
                        <span>{contract.can_update? "True" : "False"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ContractRequest;