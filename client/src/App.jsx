import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import logo from './assets/logo/barcaLogo.png'
import Home from './pages/Home/Home';
import Schedule from './pages/Schedule/Shedule';
import Login from './pages/Login/Index';
import Account from './pages/Account/Account';
import Registration from './pages/Login/Registration/Index';
import ForgotPassword from './pages/Login/ForgotPassword/Index';
import ProtectedRoute from './components/ProtectedRoute/Index';
function App() {
  return (
    <Router>
      <div>
        <main>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/schedule' element={<Schedule />}></Route>
            <Route path='/login' element={<Login />}></Route>
            <Route path='/register' element={<Registration />}></Route>
            <Route 
              path='/account' 
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } 
            />
            <Route path='/forgot' element={<ForgotPassword />}></Route>
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
