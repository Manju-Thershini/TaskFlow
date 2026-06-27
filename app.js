/* =========================================================
   TaskFlow — app.js
   Vanilla JS (ES6). No dependencies.
   Sections:
     1. Utility helpers
     2. Dark mode toggle
     3. Scroll progress bar
     4. Navbar scroll state + active link highlighting
     5. Mobile hamburger menu
     6. Smooth scroll (incl. "Choose Plan" -> Contact, "Home" -> top)
     7. Scroll-reveal animations (IntersectionObserver)
     8. Animated stats counter
     9. Blog: fetch posts with loading/error states
     10. Contact form validation + fake submit
     11. Back to top button
     12. Footer year + demo button
   ========================================================= */

(() => {
  'use strict';

  /* ---------- 1. Utility helpers ---------- */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /* ---------- 2. Dark mode toggle ---------- */
  const themeToggle = qs('#themeToggle');
  const themeIcon = qs('#themeIcon');
  const STORAGE_KEY = 'taskflow-theme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeIcon.classList.remove('fa-moon');
      themeIcon.classList.add('fa-sun');
    } else {
      document.body.classList.remove('dark-mode');
      themeIcon.classList.remove('fa-sun');
      themeIcon.classList.add('fa-moon');
    }
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      applyTheme(saved);
    } else {
      // respect OS preference if no saved choice yet
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  initTheme();

  /* ---------- 3. Scroll progress bar ---------- */
  const scrollProgress = qs('#scrollProgress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${clamp(progress, 0, 100)}%`;
  }

  /* ---------- 4. Navbar scroll state + active link ---------- */
  const navbar = qs('#navbar');
  const navLinkEls = qsa('.nav-link');
  const sections = qsa('section[id]');

  function updateNavbarState() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  function updateActiveLink() {
    // If we're at (or extremely close to) the very top, force Home active.
    if (window.scrollY < 60) {
      navLinkEls.forEach(link => link.classList.remove('active'));
      const homeLink = qs('.nav-link[href="#home"]');
      if (homeLink) homeLink.classList.add('active');
      return;
    }

    let currentSectionId = sections[0] ? sections[0].id : null;
    const offset = 120; // account for fixed navbar height + buffer

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top - offset <= 0) {
        currentSectionId = section.id;
      }
    });

    navLinkEls.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentSectionId);
    });
  }

  /* ---------- 5. Mobile hamburger menu ---------- */
  const hamburger = qs('#hamburger');
  const navLinksList = qs('#navLinks');

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navLinksList.classList.remove('open');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinksList.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  /* ---------- 6. Smooth scroll ---------- */
  // All internal nav-style links (navbar, footer, hero CTA target via href="#pricing" already native anchor)
  function smoothScrollTo(targetId) {
    const target = qs(`#${targetId}`);
    if (!target) return;

    if (targetId === 'home') {
      // Always scroll all the way to the literal top, not just the hero's offset position
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const navbarHeight = navbar.offsetHeight;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
  }

  qsa('[data-nav-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const id = href.slice(1);
        smoothScrollTo(id);
        closeMobileMenu();
      }
    });
  });

  // "Choose Plan" buttons -> scroll to Contact section, no popup/alert
  qsa('.choose-plan-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      smoothScrollTo('contact');
      // Pre-fill the message field with the chosen plan as a small helpful touch,
      // without altering the required "just smooth scroll" behavior.
      const plan = btn.getAttribute('data-plan');
      const messageField = qs('#message');
      if (messageField && !messageField.value) {
        messageField.value = `Hi, I'm interested in the ${plan} plan.`;
      }
    });
  });

  /* ---------- 7. Scroll-reveal animations ---------- */
  const revealEls = qsa('.reveal');
  const gridEls = qsa('.features-grid, .pricing-grid, .blog-grid');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => revealObserver.observe(el));
  gridEls.forEach(el => revealObserver.observe(el));

  /* ---------- 8. Animated stats counter ---------- */
  const statNumbers = qsa('.stat-number');
  let statsAnimated = false;

  function animateStats() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
      const duration = 1400;
      const startTime = performance.now();

      function tick(now) {
        const elapsed = now - startTime;
        const progress = clamp(elapsed / duration, 0, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = `${current.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = `${target.toFixed(decimals)}${suffix}`;
        }
      }
      requestAnimationFrame(tick);
    });
  }

  const heroStatsSection = qs('.hero-stats');
  if (heroStatsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          statsObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(heroStatsSection);
  }

  /* ---------- 9. Blog: fetch posts ---------- */
  const blogGrid = qs('#blogGrid');
  const BLOG_API = 'https://jsonplaceholder.typicode.com/posts?_limit=6';

  // The placeholder API returns Latin filler text (lorem-ipsum style), not real
  // English copy. We still genuinely fetch from it (to keep the real loading/
  // error/retry network behavior), but swap the title/body for our own English
  // blog content, keyed by the post's id so each card stays unique.
  const BLOG_CONTENT = {
    1: {
      title: 'Five ways to keep your team out of meetings',
      body: 'Async updates, clear task ownership and a shared timeline can replace most status meetings entirely. Here is the workflow our own team uses every week.'
    },
    2: {
      title: 'How we redesigned task boards for focus',
      body: 'Less chrome, more clarity. We walk through the design decisions behind the new board view and why fewer colors actually helped people move faster.'
    },
    3: {
      title: 'Time tracking that nobody has to remember to start',
      body: 'Manual timers get forgotten. We explain how automatic tracking works under the hood and what it means for accurate billing without the busywork.'
    },
    4: {
      title: 'Reading your analytics dashboard in five minutes',
      body: 'A short, practical guide to the three numbers that actually matter on your weekly report, and the two you can safely ignore.'
    },
    5: {
      title: 'Connecting TaskFlow to the tools you already use',
      body: 'From Slack to GitHub to Figma, integrations are only useful if they save you a click. Here is how we think about building them.'
    },
    6: {
      title: 'What SOC 2 compliance actually means for your data',
      body: 'A plain-English explanation of audit logs, access controls and why enterprise security review does not have to slow your team down.'
    }
  };

  // Deterministic placeholder cover images per post id (no external image dependency risk)
  function blogCoverGradient(id) {
    const hues = [(id * 47) % 360, (id * 47 + 60) % 360];
    return `linear-gradient(135deg, hsl(${hues[0]}, 70%, 65%), hsl(${hues[1]}, 70%, 55%))`;
  }

  function renderBlogLoading() {
    blogGrid.innerHTML = `
      <div class="blog-loading">
        <div class="spinner"></div>
        <p>Loading latest posts…</p>
      </div>
    `;
  }

  function renderBlogError() {
    blogGrid.innerHTML = `
      <div class="blog-error">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Couldn't load blog posts right now. Please check your connection and try again.</p>
        <button class="btn btn-outline retry-btn" id="retryBlogBtn">
          <i class="fa-solid fa-rotate-right"></i> Retry
        </button>
      </div>
    `;
    const retryBtn = qs('#retryBlogBtn');
    if (retryBtn) retryBtn.addEventListener('click', loadBlogPosts);
  }

  function renderBlogPosts(posts) {
    blogGrid.innerHTML = posts.map(post => {
      // Prefer our curated English copy; fall back to the raw API text only
      // if a post id we don't recognize ever comes back.
      const content = BLOG_CONTENT[post.id] || { title: post.title, body: post.body };
      return `
      <article class="blog-card">
        <div class="blog-card-image" style="background:${blogCoverGradient(post.id)}" role="img" aria-label="Cover image for ${escapeHtml(content.title)}"></div>
        <div class="blog-card-body">
          <h3 class="blog-card-title">${escapeHtml(content.title)}</h3>
          <p class="blog-card-desc">${escapeHtml(content.body)}</p>
          <a href="#" class="blog-read-more" data-post-id="${post.id}">
            Read More <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `;
    }).join('');

    // re-observe the grid for the reveal animation since content changed
    revealObserver.observe(blogGrid);

    qsa('.blog-read-more', blogGrid).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Demo-only: in a real app this would route to a full post page.
        smoothScrollTo('contact');
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async function loadBlogPosts() {
    renderBlogLoading();
    try {
      const response = await fetch(BLOG_API);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const posts = await response.json();
      if (!Array.isArray(posts) || posts.length === 0) throw new Error('Empty response');
      renderBlogPosts(posts);
    } catch (err) {
      console.error('Blog fetch failed:', err);
      renderBlogError();
    }
  }

  loadBlogPosts();

  /* ---------- 10. Contact form validation ---------- */
  const contactForm = qs('#contactForm');
  const nameInput = qs('#name');
  const emailInput = qs('#email');
  const messageInput = qs('#message');
  const formSuccess = qs('#formSuccess');

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(input, errorEl, message) {
    const group = input.closest('.form-group');
    if (message) {
      group.classList.add('invalid');
      errorEl.textContent = message;
    } else {
      group.classList.remove('invalid');
      errorEl.textContent = '';
    }
  }

  function validateForm() {
    let isValid = true;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, qs('#nameError'), 'Name is required.');
      isValid = false;
    } else {
      setFieldError(nameInput, qs('#nameError'), '');
    }

    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      setFieldError(emailInput, qs('#emailError'), 'Email is required.');
      isValid = false;
    } else if (!EMAIL_REGEX.test(emailVal)) {
      setFieldError(emailInput, qs('#emailError'), 'Please enter a valid email address.');
      isValid = false;
    } else {
      setFieldError(emailInput, qs('#emailError'), '');
    }

    if (!messageInput.value.trim()) {
      setFieldError(messageInput, qs('#messageError'), 'Message is required.');
      isValid = false;
    } else {
      setFieldError(messageInput, qs('#messageError'), '');
    }

    return isValid;
  }

  // Clear individual field errors as the user types/fixes them
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      const errorEl = qs(`#${input.id}Error`);
      if (input.value.trim()) setFieldError(input, errorEl, '');
    });
  });

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formSuccess.classList.remove('show');

    if (!validateForm()) return;

    // Simulate a submission (no backend wired up in this demo)
    const submitBtn = qs('#registerBtn');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      formSuccess.classList.add('show');
      contactForm.reset();
      submitBtn.innerHTML = originalContent;
      submitBtn.disabled = false;

      // hide the success message after a while
      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 700);
  });

  /* ---------- 11. Back to top button ---------- */
  const backToTopBtn = qs('#backToTop');

  function updateBackToTop() {
    backToTopBtn.classList.toggle('show', window.scrollY > 500);
  }

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 12. Footer year + demo button ---------- */
  qs('#currentYear').textContent = new Date().getFullYear();

  qs('#watchDemoBtn').addEventListener('click', () => {
    // Demo-only placeholder: scroll to features as a stand-in for a real video modal.
    smoothScrollTo('features');
  });

  /* ---------- Master scroll handler (throttled via rAF) ---------- */
  let scrollScheduled = false;
  function onScroll() {
    if (!scrollScheduled) {
      scrollScheduled = true;
      requestAnimationFrame(() => {
        updateScrollProgress();
        updateNavbarState();
        updateActiveLink();
        updateBackToTop();
        scrollScheduled = false;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateActiveLink);

  // Initial paint on load
  onScroll();
})();