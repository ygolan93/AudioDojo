// App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import SoundTestPage from './pages/SoundTestPage';
import Navbar from './components/NavBar';
import HomePage from './pages/HomePage';
import ModulesPage from './pages/ModulesPage';
import ProcessSetupPage from './pages/ProcessSetupPage';
import QuizModulePage from './pages/QuizModulePage';
import QuizSetupPage from './pages/QuizSetupPage';
import LessonsPage from './pages/LessonsPage';
import HistoryPage from './pages/HistoryPage';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <div className="App" id="root">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage />} />
            <Route path="/process-setup" element={<ProcessSetupPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/quiz-module" element={<QuizModulePage />} />
            <Route path="/quiz-setup" element={<QuizSetupPage />} />
            <Route path="/sound-test" element={<SoundTestPage />} />
            <Route path="/lessons" element={<LessonsPage />} />
            <Route path="/history" element={<HistoryPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
}

export default App;
