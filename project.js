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
