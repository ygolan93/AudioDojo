// App.jsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Cloudinary } from '@cloudinary/url-gen';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { AdvancedImage } from '@cloudinary/react';

import SoundTestPage from './pages/SoundTestPage';
import Navbar from './components/NavBar';
import HomePage from './pages/HomePage';
import ModulesPage from './pages/ModulesPage';
import ProcessSetupPage from './pages/ProcessSetupPage';
import QuizModulePage from './pages/QuizModulePage';
import QuizSetupPage from './pages/QuizSetupPage';
import LessonsPage from './pages/LessonsPage';
import HistoryPage from './pages/HistoryPage';
import SummaryPage from './pages/SummaryPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import Quiz from './pages/Quiz';
import { SetupProvider } from './context/setupContext.jsx';
import './index.css';
import './styles/AudioStyle.css';
import './styles/NavBarStyle.css';
import './styles/Responsive.css';
import './App.css';

function App() {
  const location = useLocation();
  const cld = new Cloudinary({ cloud: { cloudName: 'ds79llyes' } });
  

  return (
    <>
      <SetupProvider>
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
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </AnimatePresence>
      </div>
        <footer class="custom-footer">
          <div class="footer-content">
          <div class="footer-copy">
            © 2026 Yonatan Golan -  All rights reserved
          </div>
            |
            <a href="https://github.com/ygolan93" target="_blank" rel="noopener noreferrer">
              <i class="fab fa-github"></i> ygolan93
            </a>
            <a href="https://yonatan-personal.netlify.app" target="_blank" rel="noopener noreferrer">
              <i class="fas fa-folder-open"></i> Projects and CV
            </a>

          </div>

        </footer>



      </SetupProvider>
    </>
  );
}

export default App;
