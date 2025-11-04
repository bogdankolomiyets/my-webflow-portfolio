// ---------marquee

function initCSSMarquee() {
  const pixelsPerSecond = 40; // Set the marquee speed (pixels per second)
  const marquees = document.querySelectorAll("[data-css-marquee]");

  // Duplicate each [data-css-marquee-list] element inside its container
  marquees.forEach((marquee) => {
    marquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
      const duplicate = list.cloneNode(true);
      marquee.appendChild(duplicate);
    });
  });

  // Create an IntersectionObserver to check if the marquee container is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target
          .querySelectorAll("[data-css-marquee-list]")
          .forEach(
            (list) =>
              (list.style.animationPlayState = entry.isIntersecting
                ? "running"
                : "paused")
          );
      });
    },
    { threshold: 0 }
  );

  // Calculate the width and set the animation duration accordingly
  marquees.forEach((marquee) => {
    marquee.querySelectorAll("[data-css-marquee-list]").forEach((list) => {
      list.style.animationDuration = list.offsetWidth / pixelsPerSecond + "s";
      list.style.animationPlayState = "paused";
    });
    observer.observe(marquee);
  });
}

// Initialize CSS Marquee
document.addEventListener("DOMContentLoaded", function () {
  initCSSMarquee();
});

//Accordion
function initAccordionCSS() {
  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      const closeSiblings =
        accordion.getAttribute("data-accordion-close-siblings") === "true";

      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return; // Exit if the clicked element is not a toggle

        const singleAccordion = toggle.closest("[data-accordion-status]");
        if (!singleAccordion) return; // Exit if no accordion container is found

        const isActive =
          singleAccordion.getAttribute("data-accordion-status") === "active";
        singleAccordion.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );

        // When [data-accordion-close-siblings="true"]
        if (closeSiblings && !isActive) {
          accordion
            .querySelectorAll('[data-accordion-status="active"]')
            .forEach((sibling) => {
              if (sibling !== singleAccordion)
                sibling.setAttribute("data-accordion-status", "not-active");
            });
        }
      });
    });
}

// Initialize Accordion CSS
document.addEventListener("DOMContentLoaded", () => {
  initAccordionCSS();
});

//----------Hero animation

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-letter-reveal='true']").forEach((textEl) => {
    const split = new SplitText(textEl, {
      type: "words, chars",
      mask: "words",
      wordsClass: "word",
      charsClass: "char",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: textEl,
        start: "top bottom",
        end: "top 80%",
        toggleActions: "none play none reset",
      },
    });

    tl.from(split.chars, {
      yPercent: 110,
      opacity: 1,
      delay: 0.8,
      duration: 0.8,
      ease: "power3.out",
      stagger: { amount: 0.5 },
    });

    gsap.set(textEl, { visibility: "visible" });
  });

  // New nav links animation
  const navLinks = document.querySelectorAll(".nav-links-wrap a");
  // Hide links initially
  gsap.set(navLinks, { visibility: "hidden", opacity: 0, y: 50 });

  // Animate links on load with stagger
  gsap.to(navLinks, {
    visibility: "visible",
    opacity: 1,
    y: 0,
    duration: 0.4,
    ease: "power3.out",
    stagger: { each: 0.02 },
    delay: 1.2,
  });
});

// Sticky Proccess

gsap.registerPlugin(ScrollTrigger);

function initStackingCardsParallax() {
  const cards = document.querySelectorAll("[data-stacking-cards-item]");

  if (cards.length < 2) return;

  cards.forEach((card, i) => {
    // Skip over the first section
    if (i === 0) return;

    // When current section is in view, target the PREVIOUS one
    const previousCard = cards[i - 1];
    if (!previousCard) return;

    // Find any element inside the previous card
    const previousCardImage = previousCard.querySelector(
      "[data-stacking-cards-img]"
    );

    let tl = gsap.timeline({
      defaults: {
        ease: "none",
        duration: 1,
      },
      scrollTrigger: {
        trigger: card,
        start: "top bottom",
        end: "top top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(previousCard, { yPercent: 0 }, { yPercent: 50 }).fromTo(
      previousCardImage,
      { rotate: 0, yPercent: 0 },
      { rotate: -5, yPercent: -25 },
      "<"
    );
  });
}

// Initialize Stacking Cards Parallax
document.addEventListener("DOMContentLoaded", () => {
  initStackingCardsParallax();
});

// ----- Project cards
const cards = document.querySelectorAll(".project_card");

cards.forEach((card) => {
  const extraImg = card.querySelector("[project-extra-image]");
  const overlay = card.querySelector(".blur-dark-overlay");

  const type = extraImg.getAttribute("project-extra-image");

  let yCenter;
  if (type === "square") {
    yCenter = 0;
  } else if (type === "widescreen") {
    yCenter = 0;
  } else {
    yCenter = 0;
  }
  const yStart = 200;

  gsap.set(extraImg, { yPercent: yStart });
  gsap.set(overlay, { opacity: 0 });

  card.addEventListener("mouseenter", () => {
    gsap.to(overlay, {
      opacity: 1,
      duration: 0.2,
      ease: "power3.inOut",
    });

    gsap.to(extraImg, {
      yPercent: yCenter,
      duration: 0.5,
      ease: "power3.inOut",
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: "power3.inOut",
    });
    gsap.to(extraImg, {
      yPercent: yStart,
      duration: 0.5,
      ease: "power3.inOut",
    });
  });
});

// Text stagger appear
document.querySelectorAll("[project-card]").forEach((card) => {
  const title = card.querySelector("[project-card-title]");
  const split = new SplitText(title, { type: "words, chars" });
  const letters = split.chars;

  card.addEventListener("mouseenter", () => {
    gsap.to(letters, {
      yPercent: -100,
      duration: 0.4,
      ease: "power4.inOut",
      stagger: { each: 0.01 },
      overwrite: true,
    });
  });

  card.addEventListener("mouseleave", () => {
    gsap.to(letters, {
      yPercent: 0,
      duration: 0.3,
      ease: "power4.inOut",
      stagger: { each: 0.01 },
      overwrite: true,
    });
  });
});

// Сursor mousehover
gsap.set(".cursor", { xPercent: 5, yPercent: 40 });

let xTo = gsap.quickTo(".cursor", "x", { duration: 0.6, ease: "power3" });
let yTo = gsap.quickTo(".cursor", "y", { duration: 0.6, ease: "power3" });

document.querySelectorAll(".project_card").forEach((card) => {
  card.addEventListener("mouseenter", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });
});

window.addEventListener("mousemove", (e) => {
  xTo(e.clientX);
  yTo(e.clientY);
});

//3d hover
function init3dPerspectiveHover() {
  // Skip on touch / non-hover devices
  const canHover = window.matchMedia?.(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  if (!canHover) return () => {};

  // Skip if there's no targets on page
  const nodeList = document.querySelectorAll("[data-3d-hover-target]");
  if (!nodeList.length) return () => {};

  // Skip if user prefers reduced motion
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
    return () => {};

  const DEFAULT_MAX_DEG = 20;
  const EASE = "power3.out";
  const DURATION = 0.5;

  const targets = Array.from(nodeList).map((el) => {
    const maxAttr = parseFloat(el.getAttribute("data-max-rotate"));
    const maxRotate = Number.isFinite(maxAttr) ? maxAttr : DEFAULT_MAX_DEG;

    const setRotationX = gsap.quickSetter(el, "rotationX", "deg");
    const setRotationY = gsap.quickSetter(el, "rotationY", "deg");

    return {
      el,
      maxRotate,
      rect: el.getBoundingClientRect(),
      proxy: { rx: 0, ry: 0 },
      setRotationX,
      setRotationY,
    };
  });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isFrameScheduled = false;

  function measureAll() {
    for (const target of targets) {
      target.rect = target.el.getBoundingClientRect();
    }
  }

  function onPointerMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!isFrameScheduled) {
      isFrameScheduled = true;
      requestAnimationFrame(updateAll);
    }
  }

  function updateAll() {
    isFrameScheduled = false;

    for (const target of targets) {
      const { rect, maxRotate, proxy, setRotationX, setRotationY } = target;

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = Math.max(
        -1,
        Math.min(1, (mouseX - centerX) / (rect.width / 2 || 1))
      );
      const normY = Math.max(
        -1,
        Math.min(1, (mouseY - centerY) / (rect.height / 2 || 1))
      );

      const rotationY = normX * maxRotate;
      const rotationX = -normY * maxRotate;

      gsap.to(proxy, {
        rx: rotationX,
        ry: rotationY,
        duration: DURATION,
        ease: EASE,
        overwrite: true,
        onUpdate: () => {
          setRotationX(proxy.rx);
          setRotationY(proxy.ry);
        },
      });
    }
  }

  // stable listener so we can remove them later
  function onResize() {
    requestAnimationFrame(measureAll);
  }
  function onScroll() {
    requestAnimationFrame(measureAll);
  }

  // init
  measureAll();
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });

  // expose cleanup
  function destroy() {
    document.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll);
  }

  return destroy;
}

document.addEventListener("DOMContentLoaded", () => {
  init3dPerspectiveHover();
});
