/* =========================================================
   Zain Nawaz — Portfolio interactions
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  /* ---- current year ---- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- typed.js hero ---- */
  if (window.Typed) {
    new Typed('#typed', {
      strings: ['Software Engineer'],
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 1600,
      loop: true,
    });
  }

  /* ---- header shrink on scroll ---- */
  const header = document.querySelector('.header');
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('show', y > 500);
    spyActiveLink();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- mobile menu ---- */
  const menuToggle = document.getElementById('menuToggle');
  const navbar = document.getElementById('navbar');
  menuToggle?.addEventListener('click', () => {
    navbar.classList.toggle('open');
    const open = navbar.classList.contains('open');
    menuToggle.innerHTML = open ? '<i class="bx bx-x"></i>' : '<i class="bx bx-menu"></i>';
  });
  navbar?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      navbar.classList.remove('open');
      menuToggle.innerHTML = '<i class="bx bx-menu"></i>';
    })
  );

  /* ---- theme toggle (persists) ---- */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') document.body.classList.add('light');
  syncThemeIcon();
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('light');
    localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
    syncThemeIcon();
  });
  function syncThemeIcon() {
    const light = document.body.classList.contains('light');
    themeToggle.innerHTML = light ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
  }

  /* ---- active nav link (scroll spy) ---- */
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.navbar a')];
  function spyActiveLink() {
    const pos = window.scrollY + 120;
    let current = sections[0]?.id;
    for (const sec of sections) {
      if (sec.offsetTop <= pos) current = sec.id;
    }
    navLinks.forEach((l) =>
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`)
    );
  }

  /* ---- reveal on scroll + trigger bars/counters ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---- animated skill bars ---- */
  const bars = document.querySelectorAll('.bar');
  const barIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const pct = e.target.getAttribute('data-percent');
          e.target.querySelector('.bar-fill').style.width = pct + '%';
          barIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach((b) => barIO.observe(b));

  /* ---- animated counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          countIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  counters.forEach((c) => countIO.observe(c));
  function animateCount(el) {
    const target = +el.getAttribute('data-count');
    let n = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      n += step;
      if (n >= target) {
        el.textContent = target + '+';
      } else {
        el.textContent = n;
        requestAnimationFrame(tick);
      }
    };
    tick();
  }

  /* ---- cursor glow (desktop only) ---- */
  const glow = document.querySelector('.cursor-glow');
  if (glow && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      glow.style.opacity = '1';
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  /* ---- contact form (connected to backend) ---- */
  // When the site is served by the Node server (locally on :5000 or when
  // deployed together), a relative URL works on the same origin.
  // If you host the frontend separately, set the full backend URL here, e.g.
  // const API_URL = 'https://your-app.onrender.com/api/contact';
  const API_URL = '/api/contact';

  const form = document.getElementById('contactForm');
  const note = document.getElementById('formNote');
  const submitBtn = document.getElementById('submitBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
    };

    // basic client-side guard
    if (!payload.name || !payload.email || !payload.message) {
      showNote('Please fill in your name, email, and message.', 'error');
      return;
    }

    const originalBtn = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending… <i class="bx bx-loader-alt bx-spin"></i>';
    showNote('', '');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        showNote(data.message || 'Message sent successfully! ✅', 'success');
        form.reset();
      } else {
        showNote(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showNote('Could not reach the server. Is the backend running?', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtn;
    }
  });

  function showNote(msg, type) {
    if (!note) return;
    note.textContent = msg;
    note.style.color = type === 'error' ? '#ff6b8a' : 'var(--accent)';
    if (msg && type === 'success') setTimeout(() => (note.textContent = ''), 8000);
  }

  onScroll();
});
