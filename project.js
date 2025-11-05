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

//-------Footer Parallax
gsap.registerPlugin(ScrollTrigger);

function initFooterParallax() {
  document.querySelectorAll("[data-footer-parallax]").forEach((el) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "clamp(top bottom)",
        end: "clamp(top top)",
        scrub: true,
      },
    });

    const inner = el.querySelector("[data-footer-parallax-inner]");
    const dark = el.querySelector("[data-footer-parallax-dark]");

    if (inner) {
      tl.from(inner, {
        yPercent: -25,
        ease: "linear",
      });
    }

    if (dark) {
      tl.from(
        dark,
        {
          opacity: 0.5,
          ease: "linear",
        },
        "<"
      );
    }
  });
}
// Initialize Footer with Parallax Effect
document.addEventListener("DOMContentLoaded", () => {
  initFooterParallax();
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
