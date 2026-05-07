document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('overlay');

  function initializeTheme() {
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark') {
      htmlElement.classList.add('dark');
      updateToggleButton(true);
    } else {
      htmlElement.classList.remove('dark');
      updateToggleButton(false);
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

  fetch('blogs.xml')
    .then(response => response.text())
    .then(xmlText => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, 'text/xml');
      const blogs = xml.querySelectorAll('blog');
      const container = document.getElementById('blogsList');

      blogs.forEach((blog, i) => {
        const text = blog.querySelector('text').textContent;
        const url = blog.querySelector('url').textContent;
        const card = document.createElement('a');
        card.href = url;
        card.target = '_blank';
        card.rel = 'noopener';
        card.className = 'blog-card';
        card.innerHTML = `
          <div class="blog-card-icon">📝</div>
          <h3>${text}</h3>
          <span class="blog-link">Read on Blogger →</span>
        `;
        container.appendChild(card);
      });
    })
    .catch(() => {
      document.getElementById('blogsList').innerHTML = '<p style="color:var(--color-text-secondary)">Blogs coming soon.</p>';
    });

  const slides = document.querySelectorAll('.gallery-slide');
  const dotsContainer = document.querySelector('.gallery-dots');
  const prevBtn = document.querySelector('.gallery-nav-prev');
  const nextBtn = document.querySelector('.gallery-nav-next');
  let currentSlide = 0;
  let autoPlayInterval;

  if (slides.length > 0 && dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('gallery-dot');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.gallery-dot');

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
      resetAutoPlay();
    }

    function nextSlide() {
      goToSlide(currentSlide + 1);
    }

    function prevSlide() {
      goToSlide(currentSlide - 1);
    }

    function startAutoPlay() {
      autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    startAutoPlay();

    const galleryContainer = document.querySelector('.gallery-container');
    galleryContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    galleryContainer.addEventListener('mouseleave', startAutoPlay);

    galleryContainer.addEventListener('touchstart', () => clearInterval(autoPlayInterval), { passive: true });
    galleryContainer.addEventListener('touchend', () => startAutoPlay(), { passive: true });
  }
});
