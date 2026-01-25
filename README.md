# 🎯 Mini AimLabs

A fast-paced, browser-based aim training game inspired by **Aim Lab**, built using **HTML, CSS, and Vanilla JavaScript**.  
Designed to improve reaction time, precision, and consistency through short, repeatable gameplay sessions.

> *“Don’t blame your setup — work on improving your aim.”*

---

## 🚀 Live Preview
You can run the project locally by simply opening `index.html` in your browser.

*(Optional: add GitHub Pages link here if deployed)*

---

## 🕹️ Gameplay Overview

- Click glowing **orange targets** to score points  
- Avoid **red penalty targets**  
- Maintain streaks for **bonus points**
- Play against a **30-second timer**
- Beat your **high score** per difficulty

The game is intentionally lightweight and fully client-side — no frameworks, no libraries.

---

## ⚙️ Features

- 🎯 Dynamic target spawning
- ⏱️ Real-time countdown timer
- 🔥 Streak & combo-based scoring system
- 🚦 Difficulty modes: **Easy / Medium / Hard**
- 🧠 Penalty targets to increase challenge
- 💾 High scores saved using `localStorage`
- ⏸️ Pause / Resume support
- 📱 Responsive UI for different screen sizes
- ✨ Smooth animations & visual feedback

---

## 🎮 Controls

| Action            | Input            |
|------------------|------------------|
| Start Game       | Start button / Spacebar |
| Pause / Resume   | Pause button / Spacebar |
| Hit Target       | Mouse click      |
| Reset Game       | Reset button     |

---

## 🧩 Difficulty Settings

| Difficulty | Spawn Rate | Target Lifetime | Penalty Chance |
|-----------|------------|-----------------|----------------|
| Easy      | Slow       | Long            | Low            |
| Medium    | Balanced   | Medium          | Medium         |
| Hard      | Fast       | Short           | High           |

Each difficulty has its **own high score**, stored locally.

---

## 🛠️ Tech Stack

- **HTML5** – Structure & layout  
- **CSS3** – Styling, animations, responsive design  
- **JavaScript (ES6)** – Game logic, state management, DOM manipulation  

No external dependencies.

---

## 📁 Project Structure

```bash
Mini-AimLabs/
│
├── index.html   # Main HTML structure
├── style.css    # Styling & animations
├── script.js    # Game logic & state management
└── README.md    # Project documentation
