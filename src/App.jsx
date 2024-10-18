import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Footer from './components/Footer'

function App() {
  return (
    <Router>
      <div>
        <main>
          <Routes>
            <Route path='/' element={<Home />}></Route>
            <Route path='/contact' element={<Contact />}></Route>
            <Route path='/about' element={<About />}></Route>
            <Route path='/login' element={<Login />}></Route>
          </Routes>
        </main>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
