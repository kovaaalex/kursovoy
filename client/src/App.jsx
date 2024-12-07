import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Index';
import Schedule from './pages/Schedule/Index';
import Login from './pages/Login/Index';
import Account from './pages/Account/Account';
import Registration from './pages/Login/Registration/Index';
import ForgotPassword from './pages/Login/ForgotPassword/Index';
import ProtectedRoute from './components/ProtectedRoute/Index';
import NotFound from './pages/Error/NotFound/Index';
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
            <Route path='*' element={<NotFound />} /> {/* Для 404 */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
