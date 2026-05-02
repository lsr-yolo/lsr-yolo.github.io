document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('overlay');

  function initializeTheme() {
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'light') {
      htmlElement.classList.remove('dark');
      updateToggleButton(false);
    } else {
      htmlElement.classList.add('dark');
      updateToggleButton(true);
    }
  }

  function updateToggleButton(isDark) {
    const icon = toggleButton.querySelector('.theme-icon');
    if (isDark) {
      icon.textContent = '☀️';
    } else {
      icon.textContent = '🌙';
    }
  }

  function toggleTheme() {
    const isDark = htmlElement.classList.contains('dark');
    htmlElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    updateToggleButton(!isDark);
  }

  function toggleMobileMenu() {
    mobileMenuBtn.classList.toggle('active');
    mobileNav.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileMenu() {
    mobileMenuBtn.classList.remove('active');
    mobileNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleButton.addEventListener('click', toggleTheme);
  mobileMenuBtn.addEventListener('click', toggleMobileMenu);
  overlay.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      htmlElement.classList.toggle('dark', e.matches);
      updateToggleButton(e.matches);
    }
  });

  initializeTheme();
});
