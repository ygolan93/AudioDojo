import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import '@fontsource/assistant';
import '@fontsource/assistant/700.css'; 
import { Howler } from "howler";

function Root() {
  useEffect(() => {
    function unlock() {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume();
      }
      window.removeEventListener("click", unlock);
    }
    window.addEventListener("click", unlock, { once: true });
  }, []);

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);


