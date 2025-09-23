import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoIosSettings, IoMdVolumeHigh } from "react-icons/io";
import { useVolume } from "../context/VolumeContext";
import '../styles/NavBarStyle.css';

const Navbar = () => {
  const location = useLocation();
  const { volume, setVolume } = useVolume();
  const isMobile = window.innerWidth <= 480;
  const [showVolume, setShowVolume] = useState(false);

  return (
    <>
      <nav className="navbar">
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'focused' : ''}>HOME</Link>
          </li>
          <li>
            <Link to="/lessons" className={location.pathname === '/lessons' ? 'focused' : ''}>LESSONS</Link>
          </li>
          <li>
            <Link to="/modules" className={location.pathname === '/modules' ? 'focused' : ''}>MODULES</Link>
          </li>
          <li>
            <Link to="/history" className={location.pathname === '/history' ? 'focused' : ''}>HISTORY</Link>
          </li>
          <li>
            <Link to="/process-setup" className={location.pathname === '/process-setup' ? 'focused' : ''}>
              <IoIosSettings className="settings-icon" />
            </Link>
          </li>

          {/* כפתור הצגת סרגל ווליום רק במובייל */}
          {isMobile && (
            <li onClick={() => setShowVolume(!showVolume)} className='volume-button'>
              <IoMdVolumeHigh className="settings-icon" />
            </li>
          )}
        </ul>

        {/* בדסקטופ – מציג תמיד */}
        {!isMobile && (
          <div className="volume-control" title="Global Volume">
            <span className="volume-value">{Math.round(volume * 100)}%</span>
            <input
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Global Volume"
            />
          </div>
        )}
      </nav>

      {/* במובייל – רק אם לחצו על כפתור */}
        {isMobile && (
          <div
            className={`volume-control ${showVolume ? 'mobile-visible' : 'mobile-hidden'}`}
            title="Global Volume"
          >
            <span className="volume-value">{Math.round(volume * 100)}%</span>
            <input
              className="volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Global Volume"
            />
          </div>
        )}

    </>
  );
};

export default Navbar;
