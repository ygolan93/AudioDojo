🎧 Audio Dojo

Audio Dojo is a web-based training platform for developing critical listening skills through interactive audio quizzes.
The app focuses on ear training for audio processing concepts (starting with EQ), using real sound examples, immediate feedback, and clear performance summaries.

✨ Key Features

🎵 Audio-based quizzes – questions built around real sound examples

🎚 Critical listening training – identify frequencies, boosts/cuts, and processing changes

⚡ Instant feedback – correct / incorrect responses with visual and textual cues

📊 Final summary report – score calculation and session overview

🕘 Attempt history – review past quiz attempts (stored locally)

📱 Responsive UI – optimized for desktop and mobile

🛠 Tech Stack

React – UI and component architecture

Vite – fast development and build tooling

JavaScript (ES6+)

Tailwind CSS – utility-first styling

Firebase – data storage and configuration

LocalStorage – session history persistence

Netlify – deployment and hosting

🧠 Architecture Overview

Modular quiz engine based on question templates (JSON)

Separation between:

Process Setup (what to train)

Quiz Setup (how the quiz behaves)

Dynamic question generation based on selected parameters

Stateless UI components with shared global state via context

No user accounts in MVP (lightweight, frictionless usage)

🚀 Getting Started
git clone https://github.com/ygolan93/audio-dojo.git
cd audio-dojo
npm install
npm run dev

📌 Project Status

MVP complete and functional

Focused on EQ training (additional processes planned)

Actively iterated with real user feedback

Private codebase (not open for external contributions at this stage)

🔮 Planned Extensions

Additional audio processes (Compression, Saturation, Reverb)

Advanced quiz configuration mode

Expanded analytics & exports

Optional user profiles (post-MVP)

👤 Author

Developed and maintained by ygolan93
Frontend Developer focused on interactive, audio-driven web applications.
