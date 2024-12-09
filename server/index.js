const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const coachRoutes = require('./routes/coachRoutes');
const injuryRoutes = require('./routes/injuryRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const squadRoutes = require('./routes/squadRoutes');
const fileRoutes = require('./routes/fileRoutes');
const contractRoutes = require('./routes/contractRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const errorHandler = require('./error/errorHandler');

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

// Используем маршруты
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/injuries', injuryRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/squad', squadRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/employees', employeeRoutes);

app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});