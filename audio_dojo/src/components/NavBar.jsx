import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IoIosSettings } from "react-icons/io";
import '../styles/NavBarStyle.css';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'focused' : ''}
          >
            HOME
          </Link>
        </li>
        <li>
          <Link 
            to="/lessons" 
            className={location.pathname === '/lessons' ? 'focused' : ''}
          >
            LESSONS
          </Link>
        </li>
        <li>
          <Link 
            to="/modules" 
            className={location.pathname === '/modules' ? 'focused' : ''}
          >
            MODULES
          </Link>
        </li>
        <li>
          <Link 
            to="/history" 
            className={location.pathname === '/history' ? 'focused' : ''}
          >
            HISTORY
          </Link>
        </li>
        <li>
          <Link 
            to="/process-setup" 
            className={location.pathname === '/process-setup' ? 'focused' : ''}
          >
            <IoIosSettings className="settings-icon" />
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
