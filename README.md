# TaskFlow — SaaS Landing Page

A modern, fully responsive SaaS landing page built from scratch with **vanilla HTML5, CSS3, and JavaScript (ES6)** — no frameworks, no build tools, no dependencies beyond Google Fonts and Font Awesome icons.

> 🔗 **Live Demo:** https://manju-thershini.github.io/TaskFlow/ *(see [Deployment](#deployment) to set this up)*

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![No Frameworks](https://img.shields.io/badge/Frameworks-None-success)

---

## ✨ Overview

TaskFlow is a fictional project-management SaaS product, built as a front-end showcase covering the kind of UI patterns you'd find on real marketing sites (Stripe, Linear, Notion-style): glassmorphism navigation, animated stats, live data fetching, client-side validation, and full dark mode — all hand-written, with zero CSS/JS frameworks.

## 🚀 Features

- **Responsive on every screen size** — desktop, tablet, and mobile, using Flexbox + CSS Grid + media queries
- **Dark mode** with `localStorage` persistence, applied across every section
- **Sticky glassmorphism navbar** that shrinks on scroll, highlights the active section, and includes a working mobile hamburger menu
- **Animated hero section** with a floating dashboard mockup and count-up statistics
- **6 feature cards** with lift, icon-rotate, and gradient-border hover effects
- **3-tier pricing section** — clicking any "Choose Plan" button smooth-scrolls to the contact form (no popups or redirects)
- **Live blog section** that fetches real data from the [JSONPlaceholder](https://jsonplaceholder.typicode.com/) API, with genuine loading, error, and retry states
- **Contact form** with client-side validation (required fields + email format) and inline error messages
- **Scroll progress bar**, **back-to-top button**, and scroll-reveal animations throughout
- **Accessible by design** — semantic HTML, ARIA labels, visible focus states, and keyboard-navigable menus

## 🛠️ Built With

- **HTML5** — semantic markup
- **CSS3** — custom properties (variables), Flexbox, Grid, keyframe animations, no preprocessor
- **JavaScript (ES6)** — `fetch`, `IntersectionObserver`, `localStorage`, no jQuery
- [Font Awesome](https://fontawesome.com/) — icons (via CDN)
- [Google Fonts](https://fonts.google.com/) — Plus Jakarta Sans & Inter (via CDN)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — mock REST API for the blog section

## 📁 Project Structure

```
TaskFlow/
├── index.html      # All markup/sections
├── style.css       # All styling, organized by section, including dark mode + responsive rules
├── app.js          # All interactivity, organized by feature
└── images/         # Reserved for image assets (currently empty — visuals are CSS/SVG/icon-based)
```

## 🌐 Deployment

This project is a static site, so it deploys directly to **GitHub Pages**:

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select the `main` branch and `/ (root)` folder.
4. Save — your site will be live at `https://YOUR-USERNAME.github.io/REPO-NAME/` within a minute or two.
5. Update the live demo link at the top of this README once it's live.

## 📌 Notes

- The blog section fetches post data from a public placeholder API; the displayed titles/descriptions are custom English copy mapped onto that data, so the loading and error states reflect a real network call.
- The contact form simulates a submission (no backend is wired up) — it's a clear extension point if you want to connect it to a real email service or serverless function.
- Dark mode preference is saved per-browser via `localStorage`.

## 📄 License

This project is open source and available for learning, reference, or reuse. Feel free to fork it and adapt it for your own portfolio.

---

Built as a front-end practice project — feedback and pull requests are welcome.
