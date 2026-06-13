const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

document.addEventListener("DOMContentLoaded", () => {
  /*
    Keep the MB preloader visible for a short moment.
    Without this, the loader disappears too fast and looks like nothing happened.
  */
  setTimeout(() => {
    hidePreloader();

    safeRun(splitText);
    safeRun(initReveal);
    safeRun(initCursor);
    safeRun(initMagneticButtons);
    safeRun(initScrollEffects);
    safeRun(initCounters);
    safeRun(initMobileMenu);

    /*
      Forced horizontal page scroll is intentionally OFF.
      Projects are now user-controlled carousel for better HR/manager UX.
    */
    // safeRun(initHorizontalWork);
    // safeRun(initHorizontalAI);

    safeRun(initThemeToggle);
    safeRun(initProjectScreenshots);
    safeRun(initPitchModal);
  }, 950);
});

/* backup: even if something fails, preloader should hide */
setTimeout(hidePreloader, 1800);

function hidePreloader() {
  document.querySelector(".preloader")?.classList.add("hide");
}

function safeRun(fn) {
  try {
    if (typeof fn === "function") fn();
  } catch (error) {
    console.error(`${fn.name} error:`, error);
  }
}

function splitText() {
  $$(".split").forEach((el) => {
    const text = el.textContent.trim();
    el.innerHTML = "";

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.style.animationDelay = `${index * 0.025 + 0.2}s`;
      span.innerHTML = char === " " ? "&nbsp;" : char;
      el.appendChild(span);
    });
  });
}

function initReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("show");

        if (entry.target.classList.contains("bars")) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.18 }
  );

  $$(".reveal, .bars, .stats, .project-slide, .service-card, .timeline-item, .skill-card").forEach((el) => {
    observer.observe(el);
  });
}

function initCursor() {
  const dot = $(".cursor-dot");
  const ring = $(".cursor-ring");

  if (!dot || !ring) return;

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;

    $$(".project-slide, .service-card, .skill-card").forEach((card) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${mouseX - rect.left}px`);
      card.style.setProperty("--my", `${mouseY - rect.top}px`);
    });
  });

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;

    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    requestAnimationFrame(animateCursor);
  }

  animateCursor();

  $$("a, button, .magnetic, .project-slide, .service-card, .skill-card, .hero-name span, .section-title, .project-left h3, .service-card h3, .skill-card h3, .timeline-item h3, .eyebrow").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("grow"));
    el.addEventListener("mouseleave", () => ring.classList.remove("grow"));
  });
}

function initMagneticButtons() {
  $$(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

function initScrollEffects() {
  const navLinks = $$(".nav-links a");
  const sections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  function updateScrollEffects() {
    const scrollYValue = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    const progressBar = $(".progress span");
    if (progressBar && maxScroll > 0) {
      progressBar.style.width = `${(scrollYValue / maxScroll) * 100}%`;
    }

    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.45 && rect.bottom > window.innerHeight * 0.45) {
        navLinks.forEach((link) => link.classList.remove("active"));
        navLinks[index]?.classList.add("active");
      }
    });

    animateHeroParallax(scrollYValue);
    animateTimelineLine();
  }

  window.addEventListener("scroll", updateScrollEffects, { passive: true });
  updateScrollEffects();
}

function setupHorizontalSection(sectionSelector, trackSelector, options = {}) {
  const section = $(sectionSelector);
  const track = $(trackSelector);

  if (!section || !track) return;

  const holdStart = options.holdStart ?? 520;
  const holdEnd = options.holdEnd ?? 320;
  const reverse = options.reverse ?? false;

  let maxMove = 0;
  let ticking = false;

  function setup() {
    maxMove = Math.max(0, track.scrollWidth - window.innerWidth + 180);

    section.style.height = `${window.innerHeight + maxMove + holdStart + holdEnd}px`;

    update();
  }

  function update() {
    const rect = section.getBoundingClientRect();
    const startPoint = 110;

    const travelled = startPoint - rect.top;
    let progress = (travelled - holdStart) / Math.max(1, maxMove);

    progress = Math.max(0, Math.min(progress, 1));

    const move = reverse
      ? -maxMove + maxMove * progress
      : -maxMove * progress;

    track.style.transform = `translate3d(${move}px, 0, 0)`;

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", setup);

  setup();
}

function initHorizontalWork() {
  setupHorizontalSection("#work", ".project-stack", {
    holdStart: 650,
    holdEnd: 340,
    reverse: false
  });
}

function initHorizontalAI() {
  setupHorizontalSection("#ai-projects", ".ai-project-stack", {
    holdStart: 430,
    holdEnd: 340,
    reverse: true
  });
}

function animateHeroParallax(scrollYValue) {
  const portrait = $(".portrait-stage");

  if (portrait && scrollYValue < window.innerHeight) {
    portrait.style.transform = `translateY(${scrollYValue * 0.025}px)`;
  }

  $$(".floating-chip").forEach((chip, index) => {
    chip.style.transform = `translateY(${Math.sin(scrollYValue / 180 + index) * 10}px)`;
  });
}

function animateTimelineLine() {
  const line = $(".timeline-line");
  if (!line) return;

  const rect = line.getBoundingClientRect();
  const progress = Math.min(
    Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0),
    1
  );

  line.style.transform = `translateX(-50%) scaleY(${progress})`;
}

function initCounters() {
  let counted = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || counted) return;

        counted = true;

        $$("[data-count]").forEach((el) => {
          const target = parseFloat(el.dataset.count);
          let current = 0;
          const step = target / 70;

          const timer = setInterval(() => {
            current += step;

            if (current >= target) {
              current = target;
              clearInterval(timer);
            }

            el.textContent = Number.isInteger(target)
              ? `${Math.round(current)}+`
              : current.toFixed(2);
          }, 18);
        });
      });
    },
    { threshold: 0.3 }
  );

  const stats = $(".stats");
  if (stats) observer.observe(stats);
}

function initMobileMenu() {
  const menuButton = $(".menu-toggle");
  const mobilePanel = $(".mobile-panel");

  menuButton?.addEventListener("click", () => {
    mobilePanel?.classList.toggle("open");
    document.body.classList.toggle("lock");
  });

  $$(".mobile-panel a").forEach((link) => {
    link.addEventListener("click", () => {
      mobilePanel?.classList.remove("open");
      document.body.classList.remove("lock");
    });
  });
}

function initThemeToggle() {
  const button = $("#themeToggle");
  const profile = $("#profilePhoto");

  if (!button) return;

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    button.textContent = "🌙";

    if (profile && profile.dataset.light) {
      profile.src = profile.dataset.light;
    }
  }

  button.addEventListener("click", () => {
    document.body.classList.toggle("light");

    const isLight = document.body.classList.contains("light");
    localStorage.setItem("theme", isLight ? "light" : "dark");

    button.textContent = isLight ? "🌙" : "☀️";

    if (profile) {
      profile.src = isLight ? profile.dataset.light : profile.dataset.dark;
    }
  });
}

function initProjectScreenshots() {
  $$(".project-slide").forEach((card) => {
    const mainImage = $(".project-visual img", card);
    const thumbs = $$(".screenshot-strip img", card);

    if (!mainImage || thumbs.length === 0) return;

    thumbs.forEach((thumb, index) => {
      if (index === 0) thumb.classList.add("active");

      thumb.addEventListener("click", () => {
        mainImage.src = thumb.src;

        thumbs.forEach((item) => item.classList.remove("active"));
        thumb.classList.add("active");
      });
    });
  });
}
function initPitchModal() {
  const openBtn = $("#pitchOpen");
  const modal = $("#pitchModal");
  const closeBtn = $("#pitchClose");
  const contactBtn = $("#pitchContact");

  if (!openBtn || !modal || !closeBtn) return;

  function openModal() {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }

  openBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  contactBtn?.addEventListener("click", closeModal);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}
/* ======================================================
   Phone icon: mobile = call dialer, desktop = WhatsApp
   ====================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const phoneLink = document.querySelector(".phone-icon");

  if (!phoneLink) return;

  phoneLink.addEventListener("click", (e) => {
    e.preventDefault();

    const phone = phoneLink.getAttribute("data-phone");
    const whatsapp = phoneLink.getAttribute("data-whatsapp");

    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = `tel:${phone}`;
    } else {
      window.open(whatsapp, "_blank", "noopener,noreferrer");
    }
  });
});
/* ======================================================
   Project Image Lightbox
   Applies to #work and #ai-projects images
   ====================================================== */

function initProjectImageLightbox(){
  const modal = document.getElementById("imageLightbox");
  const modalImage = document.getElementById("lightboxImage");
  const modalTitle = document.getElementById("lightboxTitle");
  const modalCount = document.getElementById("lightboxCount");
  const modalThumbs = document.getElementById("lightboxThumbs");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");

  if (!modal || !modalImage || !modalTitle || !modalCount || !modalThumbs) return;

  let images = [];
  let currentIndex = 0;
  let currentTitle = "Project Images";

  const getImageSrc = (img) => img.getAttribute("src") || img.currentSrc || img.src;

  const getCardImages = (clickedImg) => {
    const card = clickedImg.closest(".project-slide, .ai-grid-card, .ai-project-card, article");

    if (!card) {
      return [{
        src: getImageSrc(clickedImg),
        alt: clickedImg.getAttribute("alt") || "Project image"
      }];
    }

    const cardImages = Array.from(card.querySelectorAll("img"));
    const seen = new Set();

    return cardImages
      .map((img) => ({
        src: getImageSrc(img),
        alt: img.getAttribute("alt") || "Project image"
      }))
      .filter((item) => {
        if (!item.src || seen.has(item.src)) return false;
        seen.add(item.src);
        return true;
      });
  };

  const getCardTitle = (clickedImg) => {
    const card = clickedImg.closest(".project-slide, .ai-grid-card, .ai-project-card, article");
    if (!card) return "Project Images";

    return (
      card.getAttribute("data-title") ||
      card.querySelector("h3")?.textContent?.trim() ||
      "Project Images"
    );
  };

  const openLightbox = (clickedImg) => {
    images = getCardImages(clickedImg);
    currentTitle = getCardTitle(clickedImg);

    const clickedSrc = getImageSrc(clickedImg);
    currentIndex = images.findIndex((item) => item.src === clickedSrc);

    if (currentIndex < 0) currentIndex = 0;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    renderLightbox();
  };

  const closeLightbox = () => {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    modalImage.classList.remove("zoomed");
  };

  const renderLightbox = () => {
    if (!images.length) return;

    const item = images[currentIndex];

    modalImage.src = item.src;
    modalImage.alt = item.alt;
    modalImage.classList.remove("zoomed");

    modalTitle.textContent = currentTitle;
    modalCount.textContent = `${currentIndex + 1} / ${images.length}`;

    modalThumbs.innerHTML = "";

    images.forEach((imgItem, index) => {
      const btn = document.createElement("button");
      btn.className = `lightbox-thumb ${index === currentIndex ? "active" : ""}`;
      btn.type = "button";
      btn.setAttribute("aria-label", `Open image ${index + 1}`);

      btn.innerHTML = `<img src="${imgItem.src}" alt="${imgItem.alt}">`;

      btn.addEventListener("click", () => {
        currentIndex = index;
        renderLightbox();
      });

      modalThumbs.appendChild(btn);
    });

    const activeThumb = modalThumbs.querySelector(".lightbox-thumb.active");
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest"
      });
    }
  };

  const showNext = () => {
    if (!images.length) return;
    currentIndex = (currentIndex + 1) % images.length;
    renderLightbox();
  };

  const showPrev = () => {
    if (!images.length) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    renderLightbox();
  };

  document.querySelectorAll("#work img, #ai-projects img").forEach((img) => {
    img.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLightbox(img);
    });
  });

  closeBtn?.addEventListener("click", closeLightbox);
  nextBtn?.addEventListener("click", showNext);
  prevBtn?.addEventListener("click", showPrev);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeLightbox();
  });

  modalImage.addEventListener("click", () => {
    modalImage.classList.toggle("zoomed");
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("show")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
}

document.addEventListener("DOMContentLoaded", initProjectImageLightbox);