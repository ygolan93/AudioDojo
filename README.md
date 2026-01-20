# 🎧 Audio Dojo – MVP (Quiz Module Only)

**Audio Dojo** is a web-based training platform for developing **critical listening skills** through interactive audio quizzes.  
This repository contains an **early MVP prototype** — only the **core Quiz module is active**.  
Other UI sections (like Process Setup and History) are visible but **non-functional placeholders**.

🔗 **Live demo:** [audiodojo.netlify.app](https://audiodojo.netlify.app)

---

## ✨ Key Features (MVP)

- 🎵 **Audio-based quizzes** – questions built from real sound examples  
- 🎚 **EQ-focused training** – identify frequencies, boosts/cuts, and processing differences  
- ⚡ **Instant feedback** – see visual/textual responses per answer  
- 📊 **Final summary report** – score calculation and question breakdown  
- 🕘 **Attempt history** – review past sessions (stored locally)  
- 📱 **Responsive UI** – optimized for desktop and mobile

---

## 🛠 Tech Stack

- **React** – UI & component architecture  
- **Vite** – development & build tooling  
- **Tailwind CSS** – utility-first styling  
- **JavaScript (ES6+)**  
- **Firebase** – data config and hosting  
- **LocalStorage** – save quiz history  
- **Netlify** – live deployment

---

## 🧠 Architecture Overview

- Dynamic question generation from flexible JSON templates  
- Clear separation between:
  - **Process Setup** – what to train on (e.g. EQ, Reverb, etc.)  
  - **Quiz Setup** – how the quiz behaves (difficulty, repetitions)  
- Stateless UI components with shared global state via React Context  
- **No user accounts** (frictionless MVP access)

---

## ⚠️ Limitations

- ❌ Only the **Quiz module** is active and testable  
- ❌ Other features (Process Setup, History, etc.) are **non-functional UI elements**  
- ❌ No server-side auth or backend logic beyond Firebase config

---

## 📌 Project Status

- ✅ MVP complete and delivered for client demo  
- 🔎 Functional focus is on **EQ quiz interaction & feedback**  
- 🔒 Open-source for viewing, **not accepting contributions**  
- 💬 Feedback is welcome! Feel free to open issues for discussion or suggestions

---

## 🔮 Planned Extensions (Beyond MVP)

- More audio processes: Compression, Saturation, Reverb  
- Advanced quiz configuration mode  
- Rich analytics + PDF/Excel exports  
- Optional user profiles & score tracking

---

## 👤 Author

**Developed by [ygolan93](https://github.com/ygolan93)** –  
Frontend Developer focused on interactive, audio-driven applications built with React, Firebase & Tailwind.  
[Portfolio → yonatan-personal.netlify.app](https://yonatan-personal.netlify.app)

---

## 🚀 Getting Started (Dev Only)

> ⚠️ This repo is shared for demonstration purposes. If you still want to test locally:

```bash
git clone https://github.com/ygolan93/audio-dojo.git
cd audio-dojo
npm install
npm run dev
