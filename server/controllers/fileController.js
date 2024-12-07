const fs = require('fs');
const path = require('path');
const dataPath = path.join('D:', 'kursachSUBD', 'server', 'data')
const getFiles = (req, res) => {
    fs.readdir(dataPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Не удалось прочитать папку' });
        }
        // Фильтруем только Excel файлы
        const excelFiles = files.filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
        res.json(excelFiles);
    });
};

// Загрузка файла
const downloadFile = (req, res) => {
    const filePath = path.join(dataPath, req.params.filename);
    res.download(filePath, (err) => {
        if (err) {
            res.status(500).json({ error: 'Не удалось загрузить файл' });
        }
    });
};

module.exports = {
    getFiles,
    downloadFile
};