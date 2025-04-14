import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import SoundTestPage from './pages/SoundTestPage'
import QuizSetupPage from './pages/QuizSetupPage'
import './App.css'

function App() {
 return (
   <Router>
     <div className="App">
       <Routes>
         <Route path="/" element={<SoundTestPage />} />
          <Route path="/setup" element={<QuizSetupPage />} />
         {/* Add more routes here as needed */}
       </Routes>
     </div>
   </Router>
 )
}

export default App
