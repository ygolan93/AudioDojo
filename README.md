Audio Dojo

Audio Dojo is a web-based interactive training platform that helps musicians and audio engineers develop critical listening skills through real-time audio processing and dynamic quiz generation.

This project demonstrates the ability to design and build a full-featured frontend system that combines complex logic, real-time interaction, and user-focused experience.

Live Demo: https://audiodojo.netlify.app/
--------------------------------------------------

KEY HIGHLIGHTS

- Built a dynamic quiz engine that generates questions based on parameter combinations (frequency, gain, shape)
- Implemented real-time audio playback system with strict state control (original vs processed)
- Designed full user flow: setup → quiz → feedback → summary → history
- Developed persistent state management using Context API and localStorage
- Created export system (PDF & Excel) for user performance tracking
- Focused on UX: responsive layout, mobile support, and clear feedback loops

--------------------------------------------------

TECH STACK

Frontend:
- React (Vite)
- JavaScript (ES6+)
- CSS

Core Concepts:
- State management (Context API)
- Dynamic data generation
- Audio handling logic abstraction
- Component-based architecture

--------------------------------------------------

SYSTEM DESIGN

- JSON-based question banks with parameter expansion
- Modular audio engine (audioManager)
- Separation between Process Setup and Quiz Setup
- Local persistence for user sessions and history

--------------------------------------------------

CHALLENGES SOLVED

- Managing synchronized audio states without conflicts
- Dynamically generating valid question combinations
- Maintaining consistent UX across mobile and desktop
- Ensuring performance with repeated audio playback

--------------------------------------------------

IMPACT

- Translates complex audio theory into an interactive learning system
- Demonstrates ability to build structured, scalable frontend applications
- Shows end-to-end ownership: from idea to deployed product

--------------------------------------------------

DEPLOYMENT

- Built and deployed using Netlify
- Optimized production build via Vite

--------------------------------------------------

AUTHOR

Yonatan Golan
Frontend Developer
