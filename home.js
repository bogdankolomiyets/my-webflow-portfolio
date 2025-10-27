//-----Marquee

function initCSSMarquee() {
  const pixelsPerSecond = 75; // Set the marquee speed (pixels per second)
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

// ------------- HLS lightbox

function initBunnyLightboxPlayer() {
  var player = document.querySelector("[data-bunny-lightbox-init]");
  if (!player) return;

  var wrapper = player.closest("[data-bunny-lightbox-status]");
  if (!wrapper) return;

  var video = player.querySelector("video");
  if (!video) return;

  try {
    video.pause();
  } catch (_) {}
  try {
    video.removeAttribute("src");
    video.load();
  } catch (_) {}

  // Attribute helpers (collapsed)
  function setAttr(el, name, val) {
    var str = typeof val === "boolean" ? (val ? "true" : "false") : String(val);
    if (el.getAttribute(name) !== str) el.setAttribute(name, str);
  }
  function setStatus(s) {
    setAttr(player, "data-player-status", s);
  }
  function setMutedState(v) {
    video.muted = !!v;
    setAttr(player, "data-player-muted", video.muted);
  }
  function setFsAttr(v) {
    setAttr(player, "data-player-fullscreen", !!v);
  }
  function setActivated(v) {
    setAttr(player, "data-player-activated", !!v);
  }
  if (!player.hasAttribute("data-player-activated")) setActivated(false);

  // Elements
  var timeline = player.querySelector("[data-player-timeline]");
  var progressBar = player.querySelector("[data-player-progress]");
  var bufferedBar = player.querySelector("[data-player-buffered]");
  var handle = player.querySelector("[data-player-timeline-handle]");
  var timeDurationEls = player.querySelectorAll("[data-player-time-duration]");
  var timeProgressEls = player.querySelectorAll("[data-player-time-progress]");
  var playerPlaceholderImg = player.querySelector(
    "[data-bunny-lightbox-placeholder]"
  );

  // Flags
  var updateSize = player.getAttribute("data-player-update-size"); // "true" | "cover" | "false" | null
  var autoplay = player.getAttribute("data-player-autoplay") === "true";
  var initialMuted = player.getAttribute("data-player-muted") === "true";

  var pendingPlay = false;

  video.loop = false;
  setMutedState(initialMuted);

  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.playsInline = true;
  if (typeof video.disableRemotePlayback !== "undefined")
    video.disableRemotePlayback = true;
  if (autoplay) video.autoplay = false;

  var isSafariNative = !!video.canPlayType("application/vnd.apple.mpegurl");
  var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

  // Load/attach only when opened
  var isAttached = false;
  var currentSrc = "";
  var lastPauseBy = "";
  var rafId;
  var autoStartOnReady = false;

  // Clamp setup for [data-bunny-lightbox-calc-height]
  function setupLightboxClamp(player, wrapper, video, updateSize) {
    var calcBox = wrapper.querySelector("[data-bunny-lightbox-calc-height]");
    if (!calcBox) return;

    function getRatio() {
      if (updateSize === "cover") return null;

      if (updateSize === "true") {
        if (video.videoWidth && video.videoHeight)
          return video.videoWidth / video.videoHeight;
        var before = player.querySelector("[data-player-before]");
        if (before && before.style && before.style.paddingTop) {
          var pct = parseFloat(before.style.paddingTop);
          if (pct > 0) return 100 / pct;
        }
        var r = player.getBoundingClientRect();
        if (r.height > 0) return r.width / r.height;
        return 16 / 9;
      }

      var beforeFalse = player.querySelector("[data-player-before]");
      if (beforeFalse && beforeFalse.style && beforeFalse.style.paddingTop) {
        var pad = parseFloat(beforeFalse.style.paddingTop);
        if (pad > 0) return 100 / pad;
      }
      var rb = player.getBoundingClientRect();
      if (rb.height > 0) return rb.width / rb.height;
      return 16 / 9;
    }

    function applyClamp() {
      if (updateSize === "cover") {
        calcBox.style.maxWidth = "";
        calcBox.style.maxHeight = "";
        return;
      }

      var parent = wrapper;
      var cs = getComputedStyle(parent);
      var pt = parseFloat(cs.paddingTop) || 0;
      var pb = parseFloat(cs.paddingBottom) || 0;
      var pl = parseFloat(cs.paddingLeft) || 0;
      var pr = parseFloat(cs.paddingRight) || 0;

      var cw = parent.clientWidth - pl - pr;
      var ch = parent.clientHeight - pt - pb;
      if (cw <= 0 || ch <= 0) return;

      var ratio = getRatio();
      if (!ratio) {
        calcBox.style.maxWidth = "";
        calcBox.style.maxHeight = "";
        return;
      }

      var hIfFullWidth = cw / ratio;

      if (hIfFullWidth <= ch) {
        calcBox.style.maxWidth = "100%";
        calcBox.style.maxHeight = (hIfFullWidth / ch) * 100 + "%";
      } else {
        calcBox.style.maxHeight = "100%";
        calcBox.style.maxWidth = ((ch * ratio) / cw) * 100 + "%";
      }
    }

    var rafPending = false;
    function debouncedApply() {
      if (rafPending) return;
      if (wrapper.getAttribute("data-bunny-lightbox-status") !== "active")
        return;
      rafPending = true;
      requestAnimationFrame(function () {
        rafPending = false;
        applyClamp();
      });
    }

    var ro = new ResizeObserver(debouncedApply);
    ro.observe(wrapper);

    window.addEventListener("resize", debouncedApply);
    window.addEventListener("orientationchange", debouncedApply);

    if (updateSize === "true") {
      video.addEventListener("loadedmetadata", debouncedApply);
      video.addEventListener("loadeddata", debouncedApply);
      video.addEventListener("playing", debouncedApply);
    }

    player._applyClamp = debouncedApply;
    debouncedApply();
  }

  setupLightboxClamp(player, wrapper, video, updateSize);

  // Unified attach pipeline
  function withAttach(src, onReady) {
    if (isSafariNative) {
      video.preload = "auto";
      video.src = src;
      video.addEventListener("loadedmetadata", onReady, { once: true });
      return;
    }
    if (canUseHlsJs) {
      var hls = new Hls({ maxBufferLength: 10 });
      player._hls = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(src);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        onReady();
      });
      hls.on(Hls.Events.LEVEL_LOADED, function (e, data) {
        if (
          data &&
          data.details &&
          isFinite(data.details.totalduration) &&
          timeDurationEls.length
        ) {
          setText(timeDurationEls, formatTime(data.details.totalduration));
        }
      });
      return;
    }
    video.preload = "auto";
    video.src = src;
    video.addEventListener("loadedmetadata", onReady, { once: true });
  }

  function attachMediaFor(src) {
    if (currentSrc === src && isAttached) return;
    if (player._hls) {
      try {
        player._hls.destroy();
      } catch (_) {}
      player._hls = null;
    }
    if (timeDurationEls.length) setText(timeDurationEls, "00:00");

    currentSrc = src;
    isAttached = true;

    withAttach(src, function onReady() {
      readyIfIdle(player, pendingPlay);
      updateBeforeRatioIOSSafe();
      if (typeof player._applyClamp === "function") player._applyClamp();
      if (timeDurationEls.length && video.duration)
        setText(timeDurationEls, formatTime(video.duration));

      if (
        autoStartOnReady &&
        wrapper.getAttribute("data-bunny-lightbox-status") === "active"
      ) {
        setStatus("loading");
        safePlay(video);
        autoStartOnReady = false;
      }
    });
  }

  function ensureOpenUI(isActive) {
    var state = isActive ? "active" : "not-active";
    if (wrapper.getAttribute("data-bunny-lightbox-status") !== state) {
      wrapper.setAttribute("data-bunny-lightbox-status", state);
    }
    if (isActive && typeof player._applyClamp === "function")
      player._applyClamp();
  }

  // Centralized open policy
  function isSameSrc(next) {
    return currentSrc && currentSrc === next;
  }
  function planOnOpen(next) {
    var same = isSameSrc(next);
    if (!same) {
      try {
        if (!video.paused && !video.ended) video.pause();
      } catch (_) {}
      if (player._hls) {
        try {
          player._hls.destroy();
        } catch (_) {}
        player._hls = null;
      }
      isAttached = false;
      currentSrc = "";
      if (timeDurationEls.length) setText(timeDurationEls, "00:00");
      setActivated(false);
      setStatus("idle");

      attachMediaFor(next);
      autoStartOnReady = !!autoplay;
      pendingPlay = !!autoplay;
      return;
    }
    autoStartOnReady = !!autoplay;
    if (autoplay) {
      setStatus("loading");
      safePlay(video);
    } else {
      try {
        if (!video.paused && !video.ended) video.pause();
      } catch (_) {}
      setActivated(false);
      setStatus("paused");
    }
  }

  // Open/Close API
  function openLightbox(src, placeholderUrl) {
    if (!src) return;

    function activate() {
      ensureOpenUI(true);
      planOnOpen(src);
    }

    if (playerPlaceholderImg && placeholderUrl) {
      var needsSwap =
        playerPlaceholderImg.getAttribute("src") !== placeholderUrl;
      if (
        needsSwap ||
        !playerPlaceholderImg.complete ||
        !playerPlaceholderImg.naturalWidth
      ) {
        playerPlaceholderImg.onload = function () {
          playerPlaceholderImg.onload = null;
          activate();
        };
        playerPlaceholderImg.onerror = function () {
          playerPlaceholderImg.onerror = null;
          activate();
        };
        if (needsSwap) playerPlaceholderImg.setAttribute("src", placeholderUrl);
        else playerPlaceholderImg.dispatchEvent(new Event("load"));
      } else {
        activate();
      }
    } else {
      activate();
    }
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      pendingPlay = true;
      lastPauseBy = "";
      setStatus("loading");
      safePlay(video);
    } else {
      lastPauseBy = "manual";
      video.pause();
    }
  }
  function toggleMute() {
    setMutedState(!video.muted);
  }

  player.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-player-control]");
    if (!btn || !player.contains(btn)) return;
    var type = btn.getAttribute("data-player-control");
    if (type === "play" || type === "pause" || type === "playpause")
      togglePlay();
    else if (type === "mute") toggleMute();
    else if (type === "fullscreen") toggleFullscreen();
  });

  // Fullscreen helpers
  function isFsActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function enterFullscreen() {
    if (player.requestFullscreen) return player.requestFullscreen();
    if (video.requestFullscreen) return video.requestFullscreen();
    if (
      video.webkitSupportsFullscreen &&
      typeof video.webkitEnterFullscreen === "function"
    )
      return video.webkitEnterFullscreen();
  }
  function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (
      video.webkitDisplayingFullscreen &&
      typeof video.webkitExitFullscreen === "function"
    )
      return video.webkitExitFullscreen();
  }
  function toggleFullscreen() {
    if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen();
    else enterFullscreen();
  }
  document.addEventListener("fullscreenchange", function () {
    setFsAttr(isFsActive());
  });
  document.addEventListener("webkitfullscreenchange", function () {
    setFsAttr(isFsActive());
  });
  video.addEventListener("webkitbeginfullscreen", function () {
    setFsAttr(true);
  });
  video.addEventListener("webkitendfullscreen", function () {
    setFsAttr(false);
  });

  // Time text (not in rAF)
  function updateTimeTexts() {
    if (timeDurationEls.length)
      setText(timeDurationEls, formatTime(video.duration));
    if (timeProgressEls.length)
      setText(timeProgressEls, formatTime(video.currentTime));
  }
  video.addEventListener("timeupdate", updateTimeTexts);
  video.addEventListener("loadedmetadata", function () {
    updateTimeTexts();
    updateBeforeRatioIOSSafe();
  });
  video.addEventListener("loadeddata", function () {
    updateBeforeRatioIOSSafe();
  });
  video.addEventListener("playing", function () {
    updateBeforeRatioIOSSafe();
  });
  video.addEventListener("durationchange", updateTimeTexts);

  // rAF visuals (progress + handle only)
  function updateProgressVisuals() {
    if (!video.duration) return;
    var playedPct = (video.currentTime / video.duration) * 100;
    if (progressBar)
      progressBar.style.transform = "translateX(" + (-100 + playedPct) + "%)";
    if (handle) handle.style.left = pctClamp(playedPct) + "%";
  }
  function pctClamp(p) {
    return p < 0 ? 0 : p > 100 ? 100 : p;
  }
  function loop() {
    updateProgressVisuals();
    if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop);
  }

  // Buffered bar (not in rAF)
  function updateBufferedBar() {
    if (!bufferedBar || !video.duration || !video.buffered.length) return;
    var end = video.buffered.end(video.buffered.length - 1);
    var buffPct = (end / video.duration) * 100;
    bufferedBar.style.transform = "translateX(" + (-100 + buffPct) + "%)";
  }
  video.addEventListener("progress", updateBufferedBar);
  video.addEventListener("loadedmetadata", updateBufferedBar);
  video.addEventListener("durationchange", updateBufferedBar);

  // Media event wiring
  video.addEventListener("play", function () {
    setActivated(true);
    cancelAnimationFrame(rafId);
    loop();
    setStatus("playing");
  });
  video.addEventListener("playing", function () {
    pendingPlay = false;
    setStatus("playing");
  });
  video.addEventListener("pause", function () {
    pendingPlay = false;
    cancelAnimationFrame(rafId);
    updateProgressVisuals();
    setStatus("paused");
  });
  video.addEventListener("waiting", function () {
    setStatus("loading");
  });
  video.addEventListener("canplay", function () {
    readyIfIdle(player, pendingPlay);
  });

  // Video ended
  video.addEventListener("ended", function () {
    pendingPlay = false;
    cancelAnimationFrame(rafId);
    updateProgressVisuals();
    setActivated(false);
    video.currentTime = 0;

    // Exit fullscreen if active
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      video.webkitDisplayingFullscreen
    ) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (video.webkitExitFullscreen) video.webkitExitFullscreen();
    }

    closeLightbox();
  });

  // Scrubbing (pointer events)
  if (timeline) {
    var dragging = false,
      wasPlaying = false,
      targetTime = 0,
      lastSeekTs = 0,
      seekThrottle = 180,
      rect = null;
    window.addEventListener("resize", function () {
      if (!dragging) rect = null;
    });
    function getFractionFromX(x) {
      if (!rect) rect = timeline.getBoundingClientRect();
      var f = (x - rect.left) / rect.width;
      if (f < 0) f = 0;
      if (f > 1) f = 1;
      return f;
    }
    function previewAtFraction(f) {
      if (!video.duration) return;
      var pct = f * 100;
      if (progressBar)
        progressBar.style.transform = "translateX(" + (-100 + pct) + "%)";
      if (handle) handle.style.left = pct + "%";
      if (timeProgressEls.length)
        setText(timeProgressEls, formatTime(f * video.duration));
    }
    function maybeSeek(now) {
      if (!video.duration) return;
      if (now - lastSeekTs < seekThrottle) return;
      lastSeekTs = now;
      video.currentTime = targetTime;
    }
    function onPointerDown(e) {
      if (!video.duration) return;
      dragging = true;
      wasPlaying = !video.paused && !video.ended;
      if (wasPlaying) video.pause();
      player.setAttribute("data-timeline-drag", "true");
      rect = timeline.getBoundingClientRect();
      var f = getFractionFromX(e.clientX);
      targetTime = f * video.duration;
      previewAtFraction(f);
      maybeSeek(performance.now());
      timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var f = getFractionFromX(e.clientX);
      targetTime = f * video.duration;
      previewAtFraction(f);
      maybeSeek(performance.now());
      e.preventDefault();
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      player.setAttribute("data-timeline-drag", "false");
      rect = null;
      video.currentTime = targetTime;
      if (wasPlaying) safePlay(video);
      else {
        updateProgressVisuals();
        updateTimeTexts();
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }
    timeline.addEventListener("pointerdown", onPointerDown, { passive: false });
    if (handle)
      handle.addEventListener("pointerdown", onPointerDown, { passive: false });
  }

  // Hover/idle detection (pointer-based)
  var hoverTimer;
  var hoverHideDelay = 3000;
  function setHover(state) {
    if (player.getAttribute("data-player-hover") !== state) {
      player.setAttribute("data-player-hover", state);
    }
  }
  function scheduleHide() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () {
      setHover("idle");
    }, hoverHideDelay);
  }
  function wakeControls() {
    setHover("active");
    scheduleHide();
  }
  player.addEventListener("pointerdown", wakeControls);
  document.addEventListener("fullscreenchange", wakeControls);
  document.addEventListener("webkitfullscreenchange", wakeControls);
  var trackingMove = false;
  function onPointerMoveGlobal(e) {
    var r = player.getBoundingClientRect();
    if (
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    )
      wakeControls();
  }
  player.addEventListener("pointerenter", function () {
    wakeControls();
    if (!trackingMove) {
      trackingMove = true;
      window.addEventListener("pointermove", onPointerMoveGlobal, {
        passive: true,
      });
    }
  });
  player.addEventListener("pointerleave", function () {
    setHover("idle");
    clearTimeout(hoverTimer);
    if (trackingMove) {
      trackingMove = false;
      window.removeEventListener("pointermove", onPointerMoveGlobal);
    }
  });

  // Close Function
  function closeLightbox() {
    ensureOpenUI(false);

    var hasPlayed = false;
    try {
      if (video.played && video.played.length) {
        for (var i = 0; i < video.played.length; i++) {
          if (video.played.end(i) > 0) {
            hasPlayed = true;
            break;
          }
        }
      } else {
        hasPlayed = video.currentTime > 0;
      }
    } catch (_) {}

    try {
      if (!video.paused && !video.ended) video.pause();
    } catch (_) {}

    setActivated(false);
    setStatus(hasPlayed ? "paused" : "idle");
  }

  // Global open/close controls + ESC
  document.addEventListener("click", function (e) {
    var openBtn = e.target.closest('[data-bunny-lightbox-control="open"]');
    if (openBtn) {
      var src = openBtn.getAttribute("data-bunny-lightbox-src") || "";
      if (!src) return;
      var imgEl = openBtn.querySelector("[data-bunny-lightbox-placeholder]");
      var placeholderUrl = imgEl ? imgEl.getAttribute("src") : "";
      openLightbox(src, placeholderUrl);
      return;
    }
    var closeBtn = e.target.closest('[data-bunny-lightbox-control="close"]');
    if (closeBtn) {
      var closeInWrapper = closeBtn.closest("[data-bunny-lightbox-status]");
      if (closeInWrapper === wrapper) closeLightbox();
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  // Helper: time/text/meta/ratio utilities
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "00:00";
    var s = Math.floor(sec),
      h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      r = s % 60;
    return h > 0 ? h + ":" + pad2(m) + ":" + pad2(r) : pad2(m) + ":" + pad2(r);
  }
  function setText(nodes, text) {
    nodes.forEach(function (n) {
      n.textContent = text;
    });
  }

  // Helper: Choose best HLS level by resolution --- */
  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function (a, b) {
      return (b.width || 0) > (a.width || 0) ? b : a;
    }, levels[0]);
  }

  // Helper: Safe programmatic play
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === "function") p.catch(function () {});
  }

  // Helper: Ready status guard
  function readyIfIdle(player, pendingPlay) {
    if (
      !pendingPlay &&
      player.getAttribute("data-player-activated") !== "true" &&
      player.getAttribute("data-player-status") === "idle"
    ) {
      player.setAttribute("data-player-status", "ready");
    }
  }

  // Helper: Ratio Setter
  function setBeforeRatio(player, updateSize, w, h) {
    if (updateSize !== "true" || !w || !h) return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;
    before.style.paddingTop = (h / w) * 100 + "%";
  }
  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== "true") return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;
    var hasPad = before.style.paddingTop && before.style.paddingTop !== "0%";
    if (!hasPad && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  // Helper: robust ratio setter for iOS Safari (with HLS fallback)
  function updateBeforeRatioIOSSafe() {
    if (updateSize !== "true") return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;

    function apply(w, h) {
      if (!w || !h) return;
      before.style.paddingTop = (h / w) * 100 + "%";
      if (typeof player._applyClamp === "function") player._applyClamp();
    }

    if (video.videoWidth && video.videoHeight) {
      apply(video.videoWidth, video.videoHeight);
      return;
    }

    if (player._hls && player._hls.levels && player._hls.levels.length) {
      var lvls = player._hls.levels;
      var best = lvls.reduce(function (a, b) {
        return (b.width || 0) > (a.width || 0) ? b : a;
      }, lvls[0]);
      if (best && best.width && best.height) {
        apply(best.width, best.height);
        return;
      }
    }

    requestAnimationFrame(function () {
      if (video.videoWidth && video.videoHeight) {
        apply(video.videoWidth, video.videoHeight);
        return;
      }

      var master =
        typeof currentSrc === "string" && currentSrc ? currentSrc : "";
      if (!master || master.indexOf("blob:") === 0) {
        var attrSrc =
          player.getAttribute("data-bunny-lightbox-src") ||
          player.getAttribute("data-player-src") ||
          "";
        if (attrSrc && attrSrc.indexOf("blob:") !== 0) master = attrSrc;
      }
      if (!master || !/^https?:/i.test(master)) return;

      fetch(master, { credentials: "omit", cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error();
          return r.text();
        })
        .then(function (txt) {
          var lines = txt.split(/\r?\n/);
          var bestW = 0,
            bestH = 0,
            last = null;
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf("#EXT-X-STREAM-INF:") === 0) {
              last = line;
            } else if (last && line && line[0] !== "#") {
              var m = /RESOLUTION=(\d+)x(\d+)/.exec(last);
              if (m) {
                var W = parseInt(m[1], 10),
                  H = parseInt(m[2], 10);
                if (W > bestW) {
                  bestW = W;
                  bestH = H;
                }
              }
              last = null;
            }
          }
          if (bestW && bestH) apply(bestW, bestH);
        })
        .catch(function () {});
    });
  }
}

// Initialize Bunny HTML HLS Lightbox
document.addEventListener("DOMContentLoaded", function () {
  initBunnyLightboxPlayer();
});
