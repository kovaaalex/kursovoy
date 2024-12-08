const express = require('express');
const cors = require('cors');
const authController = require('./controllers/authController');
const playerController = require('./controllers/playerController');
const coachController = require('./controllers/coachController');
const injuryController = require('./controllers/injuryController');
const scheduleController = require('./controllers/scheduleController');
const squadController = require('./controllers/squadController');
const fileController = require('./controllers/fileController')
const contractController = require('./controllers/contractController')
const employeeController = require('./controllers/employeeController')
const router = express.Router();
const PORT = process.env.PORT || 5000
const app = express();
app.use(cors());
app.use(express.json());

// Маршруты для аутентификации
app.post('/api/login', authController.login);
app.post('/api/register', authController.register);
app.post('/api/forgot', authController.forgotPassword);
app.put('/api/newpassword', authController.updatePassword);
app.get('/api/protected', authController.protectedRoute);

// Маршруты для игроков
app.get('/api/players', playerController.getPlayers);
app.get('/api/currentplayers', playerController.getCurrentPlayers);
app.put('/api/updatePlayerPermission/:id', playerController.updatePlayerPermission);
app.post('/api/player_injury', playerController.addPlayerInjury);

// Маршруты для тренеров
app.get('/api/coaches', coachController.getCoaches);
app.get('/api/coaches/:id', coachController.getCoachesById);
app.post('/api/coaches', coachController.addCoach);
app.put('/api/coaches/:id', coachController.updateCoach);
app.delete('/api/coaches/:id', coachController.deleteCoach);

// Маршруты для травм
app.get('/api/injuries', injuryController.getInjuries);
app.get('/api/injuries/:id', injuryController.getInjuryByID);
app.get('/api/injuriesList', injuryController.getInjuriesList);
app.post('/api/injuries', injuryController.addInjury);
app.put('/api/injuries/:id', injuryController.updateInjury);
app.delete('/api/injuries/:id', injuryController.deleteInjury);

// Маршруты для расписания матчей
app.get('/api/schedule', scheduleController.getSchedule);
app.post('/api/schedule', scheduleController.addMatch);
app.put('/api/schedule/:id', scheduleController.updateMatch);
app.delete('/api/schedule/:id', scheduleController.deleteMatch);

// Маршрут для получения состава
app.get('/api/squad', squadController.getSquad); // Добавляем маршрут для состава
//Маршрут для Экселя
app.post('/api/saveSquad', squadController.saveSquad)
app.get('/api/files', fileController.getFiles);
app.get('/api/files/:filename', fileController.downloadFile);

//Контракты
app.post('/api/contractRequests', contractController.putContractRequests)
app.get('/api/contractRequests', contractController.contractRequests);
app.get('/api/contractRequests/:id', contractController.contractRequestsById);
app.put('/api/contractRequests/:id', contractController.putContractById);

//Работа с сотрудниками
app.post('/api/addEmployee', employeeController.addEmployee)
app.get('/api/getEmployees', employeeController.getEmployees)
app.get('/api/getOtherEmployees', employeeController.getOtherEmployees)
app.delete('/api/deleteEmployee/:employeeId', employeeController.deleteEmployee)
//Добавить статы новому игроку
app.get('/api/getPlayersWithoutStats', playerController.getNewPlayersWithoutStats)
app.put('/api/postPlayerStats/:player_id', playerController.postPlayerStats)
// Запуск сервера
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:5000');
});