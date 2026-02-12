/* ==============================================
   JARDINS DO RENATO — script.js
   Interações: header, menu, slider, FAQ, form, 
   contadores, scroll reveal
   ============================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* -------- HEADER SCROLL -------- */
  const header = document.getElementById('siteHeader');
  let lastScroll = 0;

  const onScroll = () => {
    const y = window.scrollY;
    if (y > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = y;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------- MOBILE MENU -------- */
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Fecha menu ao clicar em link
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* -------- SMOOTH SCROLL para links internos -------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* -------- FAQ ACCORDION -------- */
  const accordionBtns = document.querySelectorAll('.accordion-btn');

  accordionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const body = btn.nextElementSibling;

      // Fecha todos os outros
      accordionBtns.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherBody = otherBtn.nextElementSibling;
          otherBody.hidden = true;
          otherBody.style.maxHeight = '0';
          otherBody.style.paddingBottom = '0';
        }
      });

      // Toggle o clicado
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        body.style.maxHeight = '0';
        body.style.paddingBottom = '0';
        setTimeout(() => { body.hidden = true; }, 400);
      } else {
        btn.setAttribute('aria-expanded', 'true');
        body.hidden = false;
        // Espera o hidden ser removido para animar
        requestAnimationFrame(() => {
          body.style.maxHeight = body.scrollHeight + 20 + 'px';
          body.style.paddingBottom = '20px';
        });
      }
    });
  });

  /* -------- SLIDER DE DEPOIMENTOS -------- */
  const sliderTrack = document.getElementById('sliderTrack');
  const sliderPrev = document.getElementById('sliderPrev');
  const sliderNext = document.getElementById('sliderNext');
  const dotsContainer = document.getElementById('sliderDots');

  if (sliderTrack && dotsContainer) {
    const slides = sliderTrack.querySelectorAll('.depoimento');
    let current = 0;
    let autoplayTimer;

    // Cria dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider-dot');

    function goTo(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      current = index;
      sliderTrack.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
      resetAutoplay();
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      autoplayTimer = setInterval(() => goTo(current + 1), 6000);
    }

    if (sliderPrev) sliderPrev.addEventListener('click', () => goTo(current - 1));
    if (sliderNext) sliderNext.addEventListener('click', () => goTo(current + 1));

    // Swipe no mobile
    let touchStartX = 0;
    let touchEndX = 0;

    sliderTrack.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    sliderTrack.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goTo(current + 1);
        else goTo(current - 1);
      }
    }, { passive: true });

    // Inicia autoplay
    resetAutoplay();
  }

  /* -------- CONTADOR ANIMADO -------- */
  const numElements = document.querySelectorAll('.num-valor');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    numElements.forEach(el => {
      const target = parseInt(el.getAttribute('data-alvo'), 10);
      const duration = 2000;
      const start = performance.now();

      function step(timestamp) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    });
  }

  /* -------- SCROLL REVEAL -------- */
  const revealElements = document.querySelectorAll(
    '.sobre-grid, .antes-depois, .servico-card, .duvidas-layout, .contato-grid, .sobre-nums'
  );

  revealElements.forEach(el => el.classList.add('reveal'));

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));

  // Observer para contadores
  if (numElements.length > 0) {
    const numSection = numElements[0].closest('.sobre-nums');
    if (numSection) {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counterObserver.observe(numSection);
    }
  }

  /* -------- STAGGERED REVEAL para cards de serviço -------- */
  const serviceCards = document.querySelectorAll('.servico-card');
  serviceCards.forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });

  /* -------- FORMULÁRIO DE CONTATO -------- */
  const form = document.getElementById('contactForm');
  const formSucesso = document.getElementById('formSucesso');

  if (form && formSucesso) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Validação simples
      const nome = form.querySelector('#nome');
      const telefone = form.querySelector('#telefone');
      let valid = true;

      [nome, telefone].forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = '#D9534F';
          valid = false;
          // Remove o erro quando digitar
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) return;

      // Simula envio (substituir por integração real)
      const submitBtn = form.querySelector('.btn-submit');
      submitBtn.textContent = 'Enviando...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.hidden = true;
        formSucesso.hidden = false;
      }, 1200);
    });
  }

  /* -------- PHONE MASK -------- */
  const phoneInput = document.getElementById('telefone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '');
      if (val.length > 11) val = val.slice(0, 11);
      
      if (val.length > 6) {
        e.target.value = `(${val.slice(0,2)}) ${val.slice(2,7)}-${val.slice(7)}`;
      } else if (val.length > 2) {
        e.target.value = `(${val.slice(0,2)}) ${val.slice(2)}`;
      } else if (val.length > 0) {
        e.target.value = `(${val}`;
      }
    });
  }

});
