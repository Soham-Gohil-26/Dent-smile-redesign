/* Dr. Muskan's Dent-O-Smile — single-page site JS */
(function () {
  // Suppress third-party browser extension errors from cluttering the console
  window.addEventListener('error', function (e) {
    if (e.filename && (e.filename.indexOf('chrome-extension:') !== -1 || e.filename.indexOf('moz-extension:') !== -1)) {
      e.stopImmediatePropagation();
      return true;
    }
  }, true);

  window.addEventListener('unhandledrejection', function (e) {
    if (e.reason && (String(e.reason).indexOf('chrome-extension:') !== -1 || (e.reason.stack && e.reason.stack.indexOf('chrome-extension:') !== -1))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });

  // Mark JS as ready for progressive animation enhancement
  document.documentElement.classList.add('js-ready');

  /* Web3Forms — delivers appointment requests to majgaonkarmuskan@gmail.com */
  var WEB3FORMS_KEY = '77b3e820-ec22-4546-b243-bcf21d165f4e';

  /* ── Year ──────────────────────────────────────────────── */
  var y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();

  /* ── Sticky nav + scrolled class ────────────────────────── */
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle('scrolled', window.scrollY > 20);
    updateActiveLink();
    toggleScrollTop();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Active nav link via section tracking ───────────────── */
  var navLinks = document.querySelectorAll('.links a[data-section]');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('data-section');
    var el = document.getElementById(id);
    if (el) sections.push({ id: id, el: el, link: link });
  });

  function updateActiveLink() {
    var scrollMid = window.scrollY + window.innerHeight / 3;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= scrollMid) current = s;
    });
    navLinks.forEach(function (l) { l.classList.remove('active'); });
    if (current) current.link.classList.add('active');
  }

  /* ── Smooth anchor scroll ───────────────────────────────── */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var navH = nav ? nav.offsetHeight : 0;
    var top = target.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top: top, behavior: 'smooth' });
    closeMobileMenu();
  });

  /* ── Mobile nav ─────────────────────────────────────────── */
  var burger = document.getElementById('burger');
  var links = document.getElementById('links');

  function closeMobileMenu() {
    if (!links || !burger) return;
    links.classList.remove('open');
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      document.body.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ── Scroll-to-top button ───────────────────────────────── */
  var scrollTopBtn = document.getElementById('scrollTop');
  function toggleScrollTop() {
    if (!scrollTopBtn) return;
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
  }
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Intersection Observer — re-triggerable scroll reveal ─ */
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var selectorString = '.reveal-fade, .reveal-up, .reveal-down, .reveal-slide-left, .reveal-slide-right, .reveal-left, .reveal-right, .reveal-scale, .scale-in, .reveal-blur';

  if (!prefersReduced && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        } else {
          entry.target.classList.remove('revealed');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    var revealEls = document.querySelectorAll(selectorString);
    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });

    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('stagger-go');
        } else {
          entry.target.classList.remove('stagger-go');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    var staggerParents = document.querySelectorAll('.stagger-parent');
    staggerParents.forEach(function (el) {
      staggerObserver.observe(el);
    });
  } else {
    document.querySelectorAll(selectorString)
      .forEach(function (el) { el.classList.add('revealed'); });
    document.querySelectorAll('.stagger-parent').forEach(function (el) { el.classList.add('stagger-go'); });
  }

  // Initial scroll check
  onScroll();

  /* ── Soft parallax on hero image ───────────────────────── */
  if (!prefersReduced) {
    var heroImg = document.querySelector('.hero-img img');
    if (heroImg) {
      window.addEventListener('scroll', function () {
        var pct = Math.min(window.scrollY / window.innerHeight, 1);
        heroImg.style.transform = 'translateY(' + (pct * 25) + 'px)';
      }, { passive: true });
    }
  }

  /* ── Appointment form ───────────────────────────────────── */
  var form = document.getElementById('bookForm');
  if (form) {
    var note = document.getElementById('formNote');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var name = (fd.get('name') || '').toString().trim();
      var phone = (fd.get('phone') || '').toString().replace(/\D/g, '');
      if (name.length < 2) { setNote('Please enter your name.', 'err'); return; }
      if (phone.length < 10) { setNote('Please enter a valid 10-digit phone number.', 'err'); return; }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Sending…';

      var treatment = fd.get('treatment') || '';
      var fullPhone = '+91' + phone.slice(-10);

      var frameName = 'w3f_' + Date.now();
      var iframe = document.createElement('iframe');
      iframe.name = frameName; iframe.style.display = 'none';
      document.body.appendChild(iframe);

      var hidden = document.createElement('form');
      hidden.action = 'https://api.web3forms.com/submit';
      hidden.method = 'POST'; hidden.target = frameName; hidden.style.display = 'none';
      [['access_key', WEB3FORMS_KEY],
       ['subject', 'New appointment request from your website'],
       ['from_name', "Dr. Muskan's Dent-O-Smile website"],
       ['name', name], ['phone', fullPhone],
       ['treatment', treatment], ['page', location.pathname]
      ].forEach(function (kv) {
        var i = document.createElement('input');
        i.type = 'hidden'; i.name = kv[0]; i.value = kv[1];
        hidden.appendChild(i);
      });
      document.body.appendChild(hidden);

      var toClinic = new Promise(function (resolve) {
        iframe.onload = function () { resolve(); };
        setTimeout(resolve, 6000);
        hidden.submit();
      }).then(function () {
        setTimeout(function () { try { hidden.remove(); iframe.remove(); } catch (e) {} }, 500);
      });

      fetch('https://agents.apsteq.com/webhook/muskan-dentosmile-leads-a35b7ed8', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: fullPhone, treatment: treatment, source: 'website', page: location.pathname })
      }).catch(function () {});

      toClinic.then(function () {
        form.reset();
        setNote('Thank you. We will call you back during clinic hours.', 'ok');
      }).catch(function () {
        setNote('Could not send. Please call us on +91 88283 54171.', 'err');
      }).finally(function () {
        btn.disabled = false; btn.textContent = 'Request appointment';
      });
    });

    function setNote(msg, cls) {
      if (!note) return;
      note.textContent = msg;
      note.className = 'form-note ' + (cls || '');
    }
  }

  /* ── Before / After Interactive Slider ─────────────────── */
  var baContainers = document.querySelectorAll('.ba-slider-container');
  baContainers.forEach(function (container) {
    var range = container.querySelector('.ba-range');
    var afterWrap = container.querySelector('.ba-after-wrap');
    var divider = container.querySelector('.ba-divider');
    if (!range || !afterWrap || !divider) return;

    var ticking = false;

    function setSliderPosition(pct) {
      pct = Math.max(0, Math.min(100, pct));
      if (!ticking) {
        window.requestAnimationFrame(function () {
          afterWrap.style.width = pct + '%';
          divider.style.left = pct + '%';
          range.value = pct;
          ticking = false;
        });
        ticking = true;
      }
    }

    range.addEventListener('input', function (e) {
      setSliderPosition(parseFloat(e.target.value));
    });

    var isDragging = false;

    function move(e) {
      if (!isDragging) return;
      var rect = container.getBoundingClientRect();
      var pageX = e.touches ? e.touches[0].pageX : e.pageX;
      var x = pageX - rect.left - window.scrollX;
      var pct = (x / rect.width) * 100;
      setSliderPosition(pct);
    }

    container.addEventListener('mousedown', function (e) {
      isDragging = true;
      container.classList.add('is-dragging');
      move(e);
    });

    container.addEventListener('touchstart', function (e) {
      isDragging = true;
      container.classList.add('is-dragging');
      move(e);
    }, { passive: true });

    window.addEventListener('mousemove', function (e) {
      if (isDragging) move(e);
    });

    window.addEventListener('touchmove', function (e) {
      if (isDragging) move(e);
    }, { passive: true });

    window.addEventListener('mouseup', function () {
      if (isDragging) {
        isDragging = false;
        container.classList.remove('is-dragging');
      }
    });

    window.addEventListener('touchend', function () {
      if (isDragging) {
        isDragging = false;
        container.classList.remove('is-dragging');
      }
    });
  });

  /* ── Google Reviews Carousel (2 Cards Per Section, 4 Sections) ───────────────────────────── */
  var gTrack = document.getElementById('gTrack');
  var gPrev = document.getElementById('gPrev');
  var gNext = document.getElementById('gNext');
  var gDotsContainer = document.getElementById('gDots');

  if (gTrack) {
    var cards = gTrack.querySelectorAll('.g-review-card');
    var autoPlayTimer = null;
    var isHovered = false;
    var currentSectionIndex = 0;

    function getCardsPerSection() {
      return window.innerWidth <= 768 ? 1 : 2;
    }

    function getNumSections() {
      return Math.ceil(cards.length / getCardsPerSection());
    }

    function renderDots() {
      if (!gDotsContainer || cards.length === 0) return;
      var numSections = getNumSections();
      gDotsContainer.innerHTML = '';
      for (var s = 0; s < numSections; s++) {
        (function (secIdx) {
          var dot = document.createElement('button');
          dot.className = 'g-dot' + (secIdx === currentSectionIndex ? ' active' : '');
          dot.setAttribute('aria-label', 'Go to review section ' + (secIdx + 1));
          dot.addEventListener('click', function () {
            scrollToSection(secIdx);
          });
          gDotsContainer.appendChild(dot);
        })(s);
      }
    }

    function scrollToSection(index) {
      var numSections = getNumSections();
      currentSectionIndex = (index + numSections) % numSections;
      var cardsPerSec = getCardsPerSection();
      var targetCardIndex = Math.min(cards.length - 1, currentSectionIndex * cardsPerSec);
      
      if (cards[targetCardIndex]) {
        var targetPos = cards[targetCardIndex].offsetLeft - gTrack.offsetLeft;
        gTrack.scrollTo({
          left: targetPos,
          behavior: 'smooth'
        });
      }
      updateActiveDot();
    }

    function updateActiveDot() {
      if (!gDotsContainer) return;
      var numSections = getNumSections();
      var maxScroll = gTrack.scrollWidth - gTrack.clientWidth;
      
      if (maxScroll <= 0) {
        currentSectionIndex = 0;
      } else if (gTrack.scrollLeft >= maxScroll - 20) {
        currentSectionIndex = numSections - 1;
      } else {
        var cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 320;
        var cardsPerSec = getCardsPerSection();
        var sectionStep = cardWidth * cardsPerSec;
        currentSectionIndex = Math.min(numSections - 1, Math.round(gTrack.scrollLeft / sectionStep));
      }

      var dots = gDotsContainer.querySelectorAll('.g-dot');
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('active', idx === currentSectionIndex);
      });
    }

    renderDots();

    if (gPrev) {
      gPrev.addEventListener('click', function () {
        scrollToSection(currentSectionIndex - 1);
      });
    }

    if (gNext) {
      gNext.addEventListener('click', function () {
        scrollToSection(currentSectionIndex + 1);
      });
    }

    gTrack.addEventListener('scroll', function () {
      updateActiveDot();
    }, { passive: true });

    window.addEventListener('resize', function () {
      renderDots();
      updateActiveDot();
    }, { passive: true });

    gTrack.addEventListener('touchstart', function () { isHovered = true; }, { passive: true });
    gTrack.addEventListener('touchend', function () { isHovered = false; }, { passive: true });

    // Auto-scroll loop: advances through all 4 sections, then seamlessly loops back to section 1
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(function () {
        if (isHovered) return;
        var nextSec = (currentSectionIndex + 1) % getNumSections();
        scrollToSection(nextSec);
      }, 4500);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    gTrack.addEventListener('mouseenter', function () { isHovered = true; });
    gTrack.addEventListener('mouseleave', function () { isHovered = false; });

    startAutoPlay();
  }

  /* ── Gallery Lightbox Modal ───────────────────────────── */
  var caseItems = document.querySelectorAll('.case-item');
  var lightbox = document.getElementById('caseLightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');
  var lightboxOverlay = document.getElementById('lightboxOverlay');
  var previousActiveElement = null;

  if (lightbox && caseItems.length > 0) {
    caseItems.forEach(function (item) {
      item.addEventListener('click', function () {
        var imgSrc = this.getAttribute('data-img');
        var title = this.getAttribute('data-title');
        if (imgSrc) {
          previousActiveElement = document.activeElement;
          lightboxImg.src = imgSrc;
          lightboxCaption.innerText = title || '';
          lightbox.classList.add('active');
          lightbox.setAttribute('aria-hidden', 'false');
          if (lightboxClose) lightboxClose.focus();
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus();
      }
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
    window.addEventListener('keydown', function (e) {
      if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'Tab') {
          e.preventDefault();
          if (lightboxClose) lightboxClose.focus();
        }
      }
    });
  }

  /* ── Clinic Interior Carousel Controls (2 Cards Per View + Arrows) ─── */
  var clinicStrip = document.getElementById('clinicStrip');
  var clinicPrev = document.getElementById('clinicPrev');
  var clinicNext = document.getElementById('clinicNext');
  var clinicFilterBtns = document.querySelectorAll('.clinic-filter-btn');
  var clinicCards = document.querySelectorAll('#clinicStrip .clinic-photo-card');

  if (clinicStrip) {
    function getClinicStep() {
      var visibleCard = clinicStrip.querySelector('.clinic-photo-card:not(.is-hidden)');
      if (visibleCard) {
        // Scroll width of 2 cards plus gap (or 1 card on mobile)
        var isMobile = window.innerWidth <= 640;
        var cardsToScroll = isMobile ? 1 : 2;
        return (visibleCard.offsetWidth + 24) * cardsToScroll;
      }
      return clinicStrip.clientWidth;
    }

    if (clinicPrev) {
      clinicPrev.addEventListener('click', function () {
        var step = getClinicStep();
        if (clinicStrip.scrollLeft <= 15) {
          // Loop to end
          clinicStrip.scrollTo({ left: clinicStrip.scrollWidth, behavior: 'smooth' });
        } else {
          clinicStrip.scrollBy({ left: -step, behavior: 'smooth' });
        }
      });
    }

    if (clinicNext) {
      clinicNext.addEventListener('click', function () {
        var step = getClinicStep();
        var maxScroll = clinicStrip.scrollWidth - clinicStrip.clientWidth;
        if (clinicStrip.scrollLeft >= maxScroll - 15) {
          // Loop to start
          clinicStrip.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          clinicStrip.scrollBy({ left: step, behavior: 'smooth' });
        }
      });
    }

    // Category Filter Handler for Clinic Interior
    if (clinicFilterBtns.length > 0 && clinicCards.length > 0) {
      clinicFilterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = this.getAttribute('data-filter');

          clinicFilterBtns.forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');

          clinicCards.forEach(function (card) {
            var cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
              card.classList.remove('is-hidden');
              card.style.display = '';
            } else {
              card.classList.add('is-hidden');
              card.style.display = 'none';
            }
          });

          // Smoothly scroll back to start of track when filter changes
          clinicStrip.scrollTo({ left: 0, behavior: 'smooth' });
        });
      });
    }
  }

  /* ── Gallery Category Filter ──────────────────────────── */
  var filterBtns = document.querySelectorAll('.gallery-filter-btn');
  var galleryCaseItems = document.querySelectorAll('#casesGrid .case-item');

  if (filterBtns.length > 0 && galleryCaseItems.length > 0) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = this.getAttribute('data-filter');

        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        galleryCaseItems.forEach(function (item) {
          var cat = item.getAttribute('data-category');
          if (filter === 'all' || cat === filter) {
            item.classList.remove('is-hidden');
          } else {
            item.classList.add('is-hidden');
          }
        });
      });
    });
  }

  /* ── Ultra-Luxury FAQ Search, Filtering & Helpful Rating ─── */
  var faqSearchInput = document.getElementById('faqSearchInput');
  var faqSearchClear = document.getElementById('faqSearchClear');
  var faqFilterBtns = document.querySelectorAll('.faq-filter-btn');
  var faqItems = document.querySelectorAll('#faqList .faq-item');
  var faqEmptyState = document.getElementById('faqEmptyState');
  var faqResetSearchBtn = document.getElementById('faqResetSearchBtn');
  var helpfulBtns = document.querySelectorAll('.helpful-btn');

  var activeFilter = 'all';
  var activeSearchQuery = '';

  function filterFaqItems() {
    var visibleCount = 0;
    faqItems.forEach(function (item) {
      var category = item.getAttribute('data-category') || '';
      var itemText = item.textContent.toLowerCase();

      var matchesCategory = (activeFilter === 'all' || category === activeFilter);
      var matchesSearch = (!activeSearchQuery || itemText.indexOf(activeSearchQuery) !== -1);

      if (matchesCategory && matchesSearch) {
        item.style.display = '';
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    if (faqEmptyState) {
      faqEmptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
    }
  }

  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', function () {
      activeSearchQuery = this.value.toLowerCase().trim();
      if (faqSearchClear) {
        faqSearchClear.style.display = activeSearchQuery.length > 0 ? 'block' : 'none';
      }
      filterFaqItems();
    });
  }

  if (faqSearchClear) {
    faqSearchClear.addEventListener('click', function () {
      if (faqSearchInput) {
        faqSearchInput.value = '';
        activeSearchQuery = '';
        this.style.display = 'none';
        filterFaqItems();
        faqSearchInput.focus();
      }
    });
  }

  if (faqResetSearchBtn) {
    faqResetSearchBtn.addEventListener('click', function () {
      if (faqSearchInput) {
        faqSearchInput.value = '';
        activeSearchQuery = '';
      }
      if (faqSearchClear) {
        faqSearchClear.style.display = 'none';
      }
      activeFilter = 'all';
      if (faqFilterBtns.length > 0) {
        faqFilterBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
      }
      filterFaqItems();
    });
  }

  if (faqFilterBtns.length > 0) {
    faqFilterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selectedCat = this.getAttribute('data-filter');

        if (this.classList.contains('active')) {
          // Toggle off
          this.classList.remove('active');
          this.setAttribute('aria-selected', 'false');
          activeFilter = 'all';
        } else {
          faqFilterBtns.forEach(function (b) {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          this.classList.add('active');
          this.setAttribute('aria-selected', 'true');
          activeFilter = selectedCat;
        }

        filterFaqItems();
      });
    });
  }

  /* Accessible Exclusive Accordion Toggle Logic */
  var faqBtns = document.querySelectorAll('.faq-question-btn');
  if (faqBtns.length > 0) {
    faqBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isCurrentlyExpanded = this.getAttribute('aria-expanded') === 'true';

        // Close all FAQ items automatically
        faqBtns.forEach(function (otherBtn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          var otherItem = otherBtn.closest('.faq-item');
          if (otherItem) {
            otherItem.classList.remove('is-open');
          }
        });

        // Toggle open if it wasn't already expanded
        if (!isCurrentlyExpanded) {
          this.setAttribute('aria-expanded', 'true');
          var item = this.closest('.faq-item');
          if (item) {
            item.classList.add('is-open');
          }
        }
      });
    });
  }

  /* Helpful Feedback Buttons */
  if (helpfulBtns.length > 0) {
    helpfulBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var parentBar = this.closest('.faq-helpful-bar');
        if (parentBar) {
          parentBar.querySelectorAll('.helpful-btn').forEach(function (b) {
            b.classList.remove('voted');
          });
          this.classList.add('voted');
          var label = parentBar.querySelector('.helpful-label');
          if (label) {
            label.textContent = 'Thank you for your feedback!';
          }
        }
      });
    });
  }
  /* ── Automatic Popup Smile Diagnostic Quiz Modal ──────────── */
  var popupQuizState = { step: 1, concern: '', timeline: '', priority: '' };
  var popupOverlay = document.getElementById('quizModalOverlay');
  var popupCloseBtn = document.getElementById('quizModalClose');
  var popupBackBtn = document.getElementById('popupQuizBackBtn');
  var popupProgressBar = document.getElementById('popupQuizProgressBar');
  var popupStepIndicator = document.getElementById('popupQuizStepIndicator');
  var btnQuizWhatsApp = document.getElementById('btnQuizWhatsApp');

  function openQuizModal() {
    if (!popupOverlay) return;
    popupOverlay.classList.add('active');
    popupOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (popupCloseBtn) popupCloseBtn.focus();
  }

  function closeQuizModal(markClosed) {
    if (!popupOverlay) return;
    popupOverlay.classList.remove('active');
    popupOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (markClosed) {
      sessionStorage.setItem('dent_quiz_closed', 'true');
    }
  }

  // Auto Trigger 3.5s after page load
  if (popupOverlay) {
    var isClosed = sessionStorage.getItem('dent_quiz_closed');
    var isCompleted = sessionStorage.getItem('dent_quiz_completed');
    if (isClosed !== 'true' && isCompleted !== 'true') {
      setTimeout(function() {
        openQuizModal();
      }, 3500);
    }

    if (popupCloseBtn) {
      popupCloseBtn.addEventListener('click', function() {
        closeQuizModal(true);
      });
    }

    popupOverlay.addEventListener('click', function(e) {
      if (e.target === popupOverlay) {
        closeQuizModal(true);
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
        closeQuizModal(true);
      }
    });
  }

  function updatePopupQuizUI() {
    // Hide all steps
    var steps = ['popupQuizStep1', 'popupQuizStep2', 'popupQuizStep3', 'popupQuizResult'];
    steps.forEach(function(sId, idx) {
      var el = document.getElementById(sId);
      if (el) {
        var isCurrent = (idx + 1 === popupQuizState.step) || (popupQuizState.step === 4 && sId === 'popupQuizResult');
        el.style.display = isCurrent ? 'block' : 'none';
        if (isCurrent) {
          el.classList.remove('step-entering');
          void el.offsetWidth;
          el.classList.add('step-entering');
        }
      }
    });

    // Update Progress Bar & Indicator
    if (popupProgressBar) {
      var pct = popupQuizState.step === 4 ? 100 : (popupQuizState.step * 33.33);
      popupProgressBar.style.width = pct + '%';
    }
    if (popupStepIndicator) {
      if (popupQuizState.step <= 3) {
        popupStepIndicator.textContent = 'Step ' + popupQuizState.step + ' of 3';
      } else {
        popupStepIndicator.textContent = 'Completed';
      }
    }
    if (popupBackBtn) {
      popupBackBtn.style.visibility = (popupQuizState.step > 1 && popupQuizState.step <= 3) ? 'visible' : 'hidden';
    }

    // Render result summary if step 4
    if (popupQuizState.step === 4) {
      renderPopupQuizResult();
    }
  }

  // Step 1 buttons
  document.querySelectorAll('#popupQuizStep1 .quiz-modal-opt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#popupQuizStep1 .quiz-modal-opt').forEach(function(b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      popupQuizState.concern = this.getAttribute('data-concern');
      popupQuizState.step = 2;
      updatePopupQuizUI();
    });
  });

  // Step 2 buttons
  document.querySelectorAll('#popupQuizStep2 .quiz-modal-opt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#popupQuizStep2 .quiz-modal-opt').forEach(function(b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      popupQuizState.timeline = this.getAttribute('data-timeline');
      popupQuizState.step = 3;
      updatePopupQuizUI();
    });
  });

  // Step 3 buttons
  document.querySelectorAll('#popupQuizStep3 .quiz-modal-opt').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#popupQuizStep3 .quiz-modal-opt').forEach(function(b) { b.classList.remove('selected'); });
      this.classList.add('selected');
      popupQuizState.priority = this.getAttribute('data-priority');
      popupQuizState.step = 4;
      updatePopupQuizUI();
    });
  });

  // Back button
  if (popupBackBtn) {
    popupBackBtn.addEventListener('click', function() {
      if (popupQuizState.step > 1) {
        popupQuizState.step--;
        updatePopupQuizUI();
      }
    });
  }

  function renderPopupQuizResult() {
    var cEl = document.getElementById('summaryConcern');
    var tEl = document.getElementById('summaryTimeline');
    var pEl = document.getElementById('summaryPriority');
    var titleEl = document.getElementById('popupQuizRecTitle');
    var descEl = document.getElementById('popupQuizRecDesc');

    if (cEl) cEl.textContent = popupQuizState.concern || 'Not selected';
    if (tEl) tEl.textContent = popupQuizState.timeline || 'Not selected';
    if (pEl) pEl.textContent = popupQuizState.priority || 'Not selected';

    if (titleEl && descEl) {
      var concern = popupQuizState.concern || '';
      if (concern.indexOf('Pain') !== -1) {
        titleEl.textContent = "Urgent Pain Relief & Tooth Preservation";
        descEl.textContent = "Dr. Muskan prioritizes immediate pain relief using gentle localized numbing before performing digital diagnostic checks.";
      } else if (concern.indexOf('Crooked') !== -1) {
        titleEl.textContent = "Custom Clear Aligner Assessment";
        descEl.textContent = "Straighten teeth discreetly without metal wires using custom 3D aligner tray mapping.";
      } else if (concern.indexOf('Yellowing') !== -1) {
        titleEl.textContent = "Medical-Grade Teeth Whitening";
        descEl.textContent = "Lift deep enamel stains by up to 5-8 shades in a single 45-minute clinical sitting.";
      } else if (concern.indexOf('Missing') !== -1) {
        titleEl.textContent = "Biocompatible Titanium Dental Implants";
        descEl.textContent = "Permanent, rock-solid tooth replacement designed to look and feel natural.";
      } else {
        titleEl.textContent = "Personalized Dental Consultation";
        descEl.textContent = "Dr. Muskan will provide a comprehensive clinical examination tailored to your comfort and health goals.";
      }
    }
  }

  // WhatsApp Button Handler
  if (btnQuizWhatsApp) {
    btnQuizWhatsApp.addEventListener('click', function() {
      var phone = "918828354171";
      var msg = "Hello Dr. Muskan! I completed the Diagnostic Smile Assessment on your website:\n\n" +
                "• Primary Concern: " + (popupQuizState.concern || "General Assessment") + "\n" +
                "• Care Timeline: " + (popupQuizState.timeline || "Routine") + "\n" +
                "• Primary Goal: " + (popupQuizState.priority || "Gentle Care") + "\n\n" +
                "I would like to book a personalized consultation with you at Dr. Muskan's Dent-O-Smile.";

      var url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(msg);
      sessionStorage.setItem('dent_quiz_completed', 'true');
      closeQuizModal(false);
      window.open(url, '_blank');
    });
  }


  /* ── Interactive Treatment Estimator Widget ──────────────── */
  var estPills = document.querySelectorAll('.est-pill');
  var estTitle = document.getElementById('estTitle');
  var estDesc = document.getElementById('estDesc');
  var estSittings = document.getElementById('estSittings');
  var estPain = document.getElementById('estPain');
  var estLongevity = document.getElementById('estLongevity');
  var estAdvice = document.getElementById('estAdvice');
  var estTech = document.getElementById('estTech');

  var estData = {
    rct: {
      title: "Root Canal Treatment (RCT)",
      desc: "Designed to eliminate pain, treat traumatic tooth damage, and save an infected tooth structure without extraction.",
      sittings: "4 – 5 Sittings",
      pain: "Pain-Free (Anaesthesia)",
      longevity: "15 – 20 Years (with Crown)",
      tech: "Apex Locator + Endo Motor + Digital X-Ray",
      advice: "Early treatment prevents root abscesses, resolves traumatic tooth injuries, and avoids extractions."
    },
    aligners: {
      title: "Clear Aligners / Invisible Braces",
      desc: "Custom-molded transparent trays that correct dental malalignment and align your teeth progressively and comfortably.",
      sittings: "6 Months – 18 Months",
      pain: "Zero Wires / Low Pressure",
      longevity: "Permanent",
      tech: "Digital 3D Scanner",
      advice: "Ideal for correcting malalignment and gaps. Wear 20-22 hours daily for maximum efficiency and fastest aesthetic alignment."
    },
    implants: {
      title: "Dental Implants",
      desc: "The gold standard for permanent single or multiple missing tooth replacement.",
      sittings: "2 – 3 Sittings",
      pain: "Pain-Free (Local Anaesthesia & Chemical Treatment)",
      longevity: "25+ Years / Lifetime",
      tech: "Physio Dispenser + Digital 3D Scanner",
      advice: "When clinically suitable, I recommend an implant as a long-term solution to restore function and help preserve the surrounding bone and teeth."
    },
    bonding: {
      title: "Direct Composite Bonding",
      desc: "Seamless artistic resin shaping to fix chipped, gapped, or discolored front teeth.",
      sittings: "1 Single Sitting",
      pain: "100% Non-Invasive / No Pain",
      longevity: "15 – 20 Years",
      tech: "Nano Composites + Curing Light",
      advice: "For minor chips, gaps, shape concerns, discolored or carious teeth, I recommend composite bonding when appropriate—it can improve your smile while preserving your natural tooth structure."
    },
    whitening: {
      title: "In-Clinic Teeth Whitening",
      desc: "Professional shade lifting for a visibly brighter, radiant smile by erasing deep coffee, tea, and stubborn surface stains.",
      sittings: "1 Visit (45–60 mins)",
      pain: "Gentle / Mild Sensitivity",
      longevity: "1 – 3 Years",
      tech: "LED Accelerator Light + Shade Guide",
      advice: "Follow up with post-treatment dietary advice to maintain brilliant brightness."
    }
  };

  estPills.forEach(function(pill) {
    pill.addEventListener('click', function() {
      estPills.forEach(function(p) { p.classList.remove('active'); });
      this.classList.add('active');
      var key = this.getAttribute('data-treatment');
      var d = estData[key];
      if (!d) return;

      if (estTitle) estTitle.textContent = d.title;
      if (estDesc) estDesc.textContent = d.desc;
      if (estSittings) estSittings.textContent = d.sittings;
      if (estPain) estPain.textContent = d.pain;
      if (estLongevity) estLongevity.textContent = d.longevity;
      if (estAdvice) estAdvice.textContent = d.advice;

      var estTechBox = document.getElementById('estTechBox') || (estTech ? estTech.parentElement : null);
      var estLongevityBox = document.getElementById('estLongevityBox') || (estLongevity ? estLongevity.parentElement : null);
      if (d.tech) {
        if (estTech) estTech.textContent = d.tech;
        if (estTechBox) estTechBox.style.display = '';
        if (estLongevityBox) {
          estLongevityBox.style.gridColumn = '';
          estLongevityBox.style.textAlign = '';
        }
      } else {
        if (estTech) estTech.textContent = '';
        if (estTechBox) estTechBox.style.display = 'none';
        if (estLongevityBox) {
          estLongevityBox.style.gridColumn = '1 / -1';
          estLongevityBox.style.textAlign = 'center';
        }
      }
    });
  });

  /* ── 4-Pillar Clinical Methodology Tabs ───────────────────── */
  var pillarTabs = document.querySelectorAll('.pillar-tab');
  var pillarTitle = document.getElementById('pillarTitle');
  var pillarBody = document.getElementById('pillarBody');
  var pillarHighlight = document.getElementById('pillarHighlight');
  var pillarImg = document.getElementById('pillarImg');

  var pillarData = {
    1: {
      title: "I. Gentle & Painless Anaesthesia",
      body: "We understand that dental anxiety is real. Dr. Muskan utilizes ultra-fine needles, topical numbing gels, and computer-calibrated administration to ensure zero pain during procedures.",
      highlight: "Patient Comfort Protocol: Every step is explained beforehand so there are zero surprises.",
      img: "assets/img/clinical-examination.jpg"
    },
    2: {
      title: "II. Hospital-Grade 6-Step Sterilization",
      body: "Your health and safety are non-negotiable. Every instrument undergoes an enzymatic disinfectant bath, pouch sealing, and Class-B autoclave sterilization.",
      highlight: "Zero Contamination Guarantee: Sealed sterile pouches are opened right in front of you.",
      img: "assets/img/pillar-sterilization-noface.png"
    },
    3: {
      title: "III. 3D Digital Intraoral Scanning",
      body: "Say goodbye to uncomfortable traditional impression paste. Dr. Muskan utilizes high-precision 3D intraoral optical scanners to capture a detailed digital 3D model of your teeth in seconds with millimeter precision.",
      highlight: "Digital Precision: View an interactive 3D virtual model of your teeth and smile design instantly.",
      img: "assets/img/pillar-scanner-noface.png"
    },
    4: {
      title: "IV. Conservative Tooth-Saving Philosophy",
      body: "Natural teeth are always superior to artificial replacements. We prioritize minimally invasive techniques, saving compromised teeth whenever clinically viable.",
      highlight: "Enamel Preservation: We preserve maximum natural tooth structure in every restoration.",
      img: "assets/img/pillar-tooth-saving.png"
    }
  };

  var pillarPanels = document.querySelectorAll('.pillar-accordion-content');

  function syncPillarsForViewport() {
    if (window.innerWidth > 768) {
      if (!document.querySelector('.pillar-tab.active')) {
        var firstTab = document.querySelector('.pillar-tab[data-pillar="1"]');
        if (firstTab) firstTab.classList.add('active');
      }
    }
  }
  syncPillarsForViewport();

  pillarTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var pId = this.getAttribute('data-pillar');
      var isActive = this.classList.contains('active');
      var targetPanel = document.querySelector('.pillar-accordion-content[data-pillar-panel="' + pId + '"]');

      if (window.innerWidth <= 768 && isActive) {
        this.classList.remove('active');
        if (targetPanel) targetPanel.classList.remove('active');
        return;
      }

      pillarTabs.forEach(function(t) { t.classList.remove('active'); });
      pillarPanels.forEach(function(p) { p.classList.remove('active'); });

      this.classList.add('active');
      if (targetPanel) targetPanel.classList.add('active');

      var p = pillarData[pId];
      if (!p) return;
      if (pillarTitle) pillarTitle.textContent = p.title;
      if (pillarBody) pillarBody.textContent = p.body;
      if (pillarHighlight) pillarHighlight.textContent = p.highlight;
      if (pillarImg && p.img) pillarImg.src = p.img;
    });
  });

  /* ── Floating Concierge Speed-Dial Menu ──────────────────── */
  var conciergeTrigger = document.getElementById('conciergeTrigger');
  var floatingConcierge = document.getElementById('floatingConcierge');

  if (conciergeTrigger && floatingConcierge) {
    conciergeTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      floatingConcierge.classList.toggle('open');
    });

    document.addEventListener('click', function(e) {
      if (!floatingConcierge.contains(e.target)) {
        floatingConcierge.classList.remove('open');
      }
    });
  }

  /* ══ Instant WhatsApp Slot Booking Modal & Slot Logic ══ */
  (function initWhatsAppSlotBooking() {
    var modalBackdrop = document.getElementById('slotModalBackdrop');
    var modalCloseBtn = document.getElementById('slotModalClose');
    var modalForm = document.getElementById('slotModalForm');
    var inlineForm = document.getElementById('inlineSlotForm');
    var modalDateInput = document.getElementById('slotDate');
    var inlineDateInput = document.getElementById('inlineSlotDate');

    // Helper: Local date formatted as YYYY-MM-DD
    function getLocalDateStr(d) {
      var date = d || new Date();
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }

    // Helper: Next open clinic date (Mon-Sat, skipping Sunday)
    function getNextOpenDateStr() {
      var d = new Date();
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) { // Sunday closed
        d.setDate(d.getDate() + 1); // Move to Monday
      }
      return getLocalDateStr(d);
    }

    // Helper: Parse slot text to minutes from midnight
    function parseSlotToMinutes(slotStr) {
      if (!slotStr) return 0;
      var match = slotStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return 0;
      var hours = parseInt(match[1], 10);
      var minutes = parseInt(match[2], 10);
      var period = match[3].toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }

    // Update slot availability & auto-select nearest available slot
    function updateSlotAvailability(formElement) {
      if (!formElement) return;
      var dateInput = formElement.querySelector('input[name="date"]');
      if (!dateInput) return;

      var now = new Date();
      var todayStr = getLocalDateStr(now);
      var currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Ensure min is set to today
      dateInput.min = todayStr;

      // Prevent past dates
      if (!dateInput.value || dateInput.value < todayStr) {
        dateInput.value = todayStr;
      }

      var selectedDate = dateInput.value;
      var isToday = (selectedDate === todayStr);

      var pills = Array.from(formElement.querySelectorAll('.slot-pill'));
      var hintEl = formElement.querySelector('.slot-time-hint') || document.getElementById('slotTimeHint');

      var nearestAvailablePill = null;
      var hasActiveValidPill = false;
      var currentActivePill = formElement.querySelector('.slot-pill.active');

      pills.forEach(function(pill) {
        var slotTime = pill.getAttribute('data-slot');
        var slotMin = parseSlotToMinutes(slotTime);

        if (isToday) {
          // If today: slot has passed if its start time is <= current time
          if (slotMin <= currentMinutes) {
            pill.disabled = true;
            pill.classList.add('is-passed');
            pill.classList.remove('active');
            pill.setAttribute('aria-disabled', 'true');
            pill.title = 'Slot passed for today';
          } else {
            pill.disabled = false;
            pill.classList.remove('is-passed');
            pill.removeAttribute('aria-disabled');
            pill.title = 'Available: ' + slotTime;
            if (!nearestAvailablePill) {
              nearestAvailablePill = pill; // First chronologically valid upcoming slot
            }
            if (pill === currentActivePill) {
              hasActiveValidPill = true;
            }
          }
        } else {
          // Future date: all slots enabled
          pill.disabled = false;
          pill.classList.remove('is-passed');
          pill.removeAttribute('aria-disabled');
          pill.title = 'Available: ' + slotTime;
          if (!nearestAvailablePill) {
            nearestAvailablePill = pill;
          }
          if (pill === currentActivePill) {
            hasActiveValidPill = true;
          }
        }
      });

      // Auto-select nearest slot if current active is invalid or nothing is selected
      if (!hasActiveValidPill && nearestAvailablePill) {
        pills.forEach(function(p) { p.classList.remove('active'); });
        nearestAvailablePill.classList.add('active');
      } else if (!nearestAvailablePill) {
        pills.forEach(function(p) { p.classList.remove('active'); });
      }

      // Update feedback hint banner
      if (hintEl) {
        var dParts = selectedDate.split('-');
        var dObj = new Date(parseInt(dParts[0], 10), parseInt(dParts[1], 10) - 1, parseInt(dParts[2], 10));
        var isSunday = (dObj.getDay() === 0);

        if (isSunday) {
          hintEl.innerHTML = '<span class="hint-warning">⚠️ Note: Clinic is closed on Sundays. Please call <a href="tel:+918828354171">+91 88283 54171</a> for special emergency care.</span>';
          hintEl.style.display = 'block';
        } else if (isToday) {
          if (!nearestAvailablePill) {
            hintEl.innerHTML = '<span class="hint-alert">⚡ Today\'s scheduled consultation slots have ended. Please select tomorrow or a future date above.</span>';
            hintEl.style.display = 'block';
          } else {
            var activeP = formElement.querySelector('.slot-pill.active') || nearestAvailablePill;
            var activeSlotName = activeP.getAttribute('data-slot');
            hintEl.innerHTML = '<span class="hint-success">✨ Nearest available upcoming slot selected: <strong>' + activeSlotName + '</strong> (past times disabled)</span>';
            hintEl.style.display = 'block';
          }
        } else {
          hintEl.innerHTML = '<span class="hint-info">📅 Showing all available consultation slots for selected date.</span>';
          hintEl.style.display = 'block';
        }
      }
    }

    // Set initial min and values
    var initialToday = getLocalDateStr();
    if (modalDateInput) {
      modalDateInput.min = initialToday;
      modalDateInput.value = initialToday;
      modalDateInput.addEventListener('change', function() {
        updateSlotAvailability(modalForm);
      });
      modalDateInput.addEventListener('input', function() {
        updateSlotAvailability(modalForm);
      });
    }
    if (inlineDateInput) {
      inlineDateInput.min = initialToday;
      inlineDateInput.value = initialToday;
      inlineDateInput.addEventListener('change', function() {
        updateSlotAvailability(inlineForm);
      });
      inlineDateInput.addEventListener('input', function() {
        updateSlotAvailability(inlineForm);
      });
    }

    // Handle Slot Pill Buttons Selection for any container
    function bindSlotPillGroup(container) {
      if (!container) return;
      var pills = container.querySelectorAll('.slot-pill');
      pills.forEach(function(pill) {
        pill.addEventListener('click', function(e) {
          e.preventDefault();
          if (this.disabled || this.classList.contains('is-passed')) return;
          pills.forEach(function(p) { p.classList.remove('active'); });
          this.classList.add('active');
        });
      });
    }

    bindSlotPillGroup(modalForm);
    bindSlotPillGroup(inlineForm);

    // Open Modal Handler
    function openSlotModal(treatmentValue) {
      if (!modalBackdrop) return;

      var now = new Date();
      var todayStr = getLocalDateStr(now);

      if (modalDateInput) {
        modalDateInput.min = todayStr;
        modalDateInput.value = todayStr;
      }

      if (treatmentValue) {
        var treatmentSelect = document.getElementById('slotTreatment');
        if (treatmentSelect) {
          for (var i = 0; i < treatmentSelect.options.length; i++) {
            if (treatmentSelect.options[i].value === treatmentValue || treatmentSelect.options[i].text.indexOf(treatmentValue) !== -1) {
              treatmentSelect.selectedIndex = i;
              break;
            }
          }
        }
      }

      if (modalForm) {
        updateSlotAvailability(modalForm);
      }

      modalBackdrop.classList.add('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var nameInput = document.getElementById('slotName');
      if (nameInput) nameInput.focus();
    }

    // Close Modal Handler
    function closeSlotModal() {
      if (!modalBackdrop) return;
      modalBackdrop.classList.remove('is-open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    // Bind triggers
    var triggers = document.querySelectorAll('[data-open-slot-modal]');
    triggers.forEach(function(trigger) {
      trigger.addEventListener('click', function(e) {
        e.preventDefault();
        var treatment = this.getAttribute('data-treatment');
        openSlotModal(treatment);
      });
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', closeSlotModal);
    }

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', function(e) {
        if (e.target === modalBackdrop) {
          closeSlotModal();
        }
      });
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('is-open')) {
        closeSlotModal();
      }
    });

    // Initial slot setup if forms exist on page
    if (modalForm) updateSlotAvailability(modalForm);
    if (inlineForm) updateSlotAvailability(inlineForm);

    // Send WhatsApp Message Logic
    function handleFormReservation(formElement) {
      if (!formElement) return;

      formElement.addEventListener('submit', function(e) {
        e.preventDefault();

        var nameInput = formElement.querySelector('input[name="name"]');
        var phoneInput = formElement.querySelector('input[name="phone"]');
        var treatmentSelect = formElement.querySelector('select[name="treatment"]');
        var dateInput = formElement.querySelector('input[name="date"]');

        var nameVal = nameInput ? nameInput.value.trim() : '';
        var phoneVal = phoneInput ? phoneInput.value.trim() : '';
        var treatmentVal = treatmentSelect ? treatmentSelect.value : 'General Check-up & Cleaning';
        var dateVal = dateInput ? dateInput.value : getLocalDateStr();
        
        var activePill = formElement.querySelector('.slot-pill.active:not(:disabled):not(.is-passed)');
        if (!activePill) {
          alert('Please select an available consultation time slot.');
          return;
        }
        var slotVal = activePill.getAttribute('data-slot');

        if (!nameVal) {
          alert('Please enter your full name.');
          if (nameInput) nameInput.focus();
          return;
        }

        if (!phoneVal || phoneVal.length < 10) {
          alert('Please enter a valid 10-digit mobile number.');
          if (phoneInput) phoneInput.focus();
          return;
        }

        // Format clean WhatsApp message
        var msg = "Hi Dr. Muskan, I would like to reserve a consultation slot at Dr. Muskan's Dent-O-Smile:\n\n" +
                  "• Name: " + nameVal + "\n" +
                  "• Phone: " + phoneVal + "\n" +
                  "• Treatment: " + treatmentVal + "\n" +
                  "• Date: " + dateVal + "\n" +
                  "• Preferred Slot: " + slotVal + "\n\n" +
                  "Please confirm availability. Thank you!";

        var waUrl = "https://wa.me/918828354171?text=" + encodeURIComponent(msg);
        
        // Open WhatsApp
        window.open(waUrl, '_blank', 'noopener,noreferrer');

        // Close modal if open
        closeSlotModal();
      });
    }

    handleFormReservation(modalForm);
    handleFormReservation(inlineForm);
  })();
})();






