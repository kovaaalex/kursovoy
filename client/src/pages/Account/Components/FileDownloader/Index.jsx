import React, { useEffect, useState } from 'react';
import styles from './FileDownloader.module.css'
function FileDownloader() {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/files');
                if (!response.ok) {
                    throw new Error('Не удалось загрузить список файлов');
                }
                const data = await response.json();
                setFiles(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchFiles();
    }, []);

    const handleDownload = (filename) => {
        // Используем window.location для загрузки файла
        window.location.href = `http://localhost:5000/api/files/${filename}`;
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.squadReports}>
            <h2>Squad reports</h2>
            <ul>
                {files.map((file) => (
                    <li key={file}>
                        <button onClick={() => handleDownload(file)}>{file}</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FileDownloader;