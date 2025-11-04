//text on scroll

window.addEventListener("DOMContentLoaded", () => {
  let typeSplit = new SplitType("[text-split]", {
    types: "lines, words",
    tagName: "span",
  });

  document.querySelectorAll(".line").forEach((line) => {
    let wrapper = document.createElement("span");
    wrapper.classList.add("line-mask");
    line.parentNode.insertBefore(wrapper, line);
    wrapper.appendChild(line);
  });

  $("[words-slide-up]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".word"), {
      yPercent: 110,
      duration: 0.5,
      ease: "power3.inOut",
      stagger: { amount: 0.3 },
    });

    ScrollTrigger.create({
      trigger: $(this),
      start: "top 80%",
      once: true, 
      onEnter: () => tl.play(),
    });
  });

  $("[lines-slide-up]").each(function () {
    let tl = gsap.timeline({ paused: true });
    tl.from($(this).find(".line"), {
      yPercent: 100,
      duration: 0.6,
      ease: "power3.inOut",
      stagger: { amount: 0.3 },
    });

    ScrollTrigger.create({
      trigger: $(this),
      start: "top 80%",
      once: true,
      onEnter: () => tl.play(),
    });
  });
});

//----------preloader
window.addEventListener("load", () => {
  const tl = gsap.timeline({
    defaults: { ease: "power3.inOut", duration: 1.2 },
  });

  tl.to(".preloader", {
    scaleY: 0,
    transformOrigin: "top center",
  });
});

//----------Floating Nav
const nav = document.querySelector(".floating-nav");
let lastScrollTop = 0;
let navVisible = true;

const hideOffsetRatio = 0.2;
let hideOffset = window.innerHeight * hideOffsetRatio;

window.addEventListener("resize", () => {
  hideOffset = window.innerHeight * hideOffsetRatio;
});

const showNav = () => {
  if (!navVisible) {
    nav.style.transform = "translateY(0)";
    navVisible = true;
  }
};

const hideNav = () => {
  if (navVisible) {
    nav.style.transform = "translateY(-120%)";
    navVisible = false;
  }
};

let ticking = false;
window.addEventListener("scroll", () => {
  const st = window.scrollY;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      if (st < hideOffset) {
        hideNav();
      } else if (st > lastScrollTop) {
        hideNav();
      } else if (st < lastScrollTop) {
        showNav();
      }
      lastScrollTop = Math.max(st, 0);
      ticking = false;
    });
    ticking = true;
  }
});

//--------Button and linksg Text stagger On hover animation

function initButtonCharacterStagger() {
  const offsetIncrement = 0.01; // Transition offset increment in seconds
  const buttons = document.querySelectorAll("[data-button-animate-chars]");

  buttons.forEach((button) => {
    const text = button.textContent; // Get the button's text content
    button.innerHTML = ""; // Clear the original content

    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;

      // Handle spaces explicitly
      if (char === " ") {
        span.style.whiteSpace = "pre"; // Preserve space width
      }

      button.appendChild(span);
    });
  });
}

// Initialize Button Character Stagger Animation
document.addEventListener("DOMContentLoaded", () => {
  initButtonCharacterStagger();
});

//--------Video Osmo

function initBunnyPlayerBasic() {
  document
    .querySelectorAll("[data-bunny-player-init]")
    .forEach(function (player) {
      var src = player.getAttribute("data-player-src");
      if (!src) return;

      var video = player.querySelector("video");
      if (!video) return;

      try {
        video.pause();
      } catch (_) {}
      try {
        video.removeAttribute("src");
        video.load();
      } catch (_) {}

      // Attribute helpers
      function setStatus(s) {
        if (player.getAttribute("data-player-status") !== s) {
          player.setAttribute("data-player-status", s);
        }
      }
      function setActivated(v) {
        player.setAttribute("data-player-activated", v ? "true" : "false");
      }
      if (!player.hasAttribute("data-player-activated")) setActivated(false);

      // Flags
      var updateSize = player.getAttribute("data-player-update-size"); // "true" | "cover" | null
      var lazyMode = player.getAttribute("data-player-lazy"); // "true" | "meta" | null
      var isLazyTrue = lazyMode === "true";
      var isLazyMeta = lazyMode === "meta";
      var autoplay = player.getAttribute("data-player-autoplay") === "true";

      // Used to suppress 'ready' flicker when user just pressed play in lazy modes
      var pendingPlay = false;

      // Autoplay forces muted + loop; IO will drive play/pause
      video.muted = !!autoplay;
      if (autoplay) video.loop = true;

      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.playsInline = true;
      if (typeof video.disableRemotePlayback !== "undefined")
        video.disableRemotePlayback = true;
      if (autoplay) video.autoplay = false;

      var isSafariNative = !!video.canPlayType("application/vnd.apple.mpegurl");
      var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

      // Minimal ratio fetch when requested (and not already handled by lazy meta)
      if (updateSize === "true" && !isLazyMeta) {
        if (isLazyTrue) {
          // Do nothing: no fetch, no <video> touch when lazy=true
        } else {
          var prev = video.preload;
          video.preload = "metadata";
          var onMeta2 = function () {
            setBeforeRatio(
              player,
              updateSize,
              video.videoWidth,
              video.videoHeight
            );
            video.removeEventListener("loadedmetadata", onMeta2);
            video.preload = prev || "";
          };
          video.addEventListener("loadedmetadata", onMeta2, { once: true });
          video.src = src;
        }
      }

      //  Lazy meta fetch (duration + aspect) without attaching playback
      function fetchMetaOnce() {
        getSourceMeta(src, canUseHlsJs).then(function (meta) {
          if (meta.width && meta.height)
            setBeforeRatio(player, updateSize, meta.width, meta.height);
          readyIfIdle(player, pendingPlay);
        });
      }

      // Attach media only once (for actual playback)
      var isAttached = false;
      var userInteracted = false;
      var lastPauseBy = ""; // 'io' | 'manual' | ''
      function attachMediaOnce() {
        if (isAttached) return;
        isAttached = true;

        if (player._hls) {
          try {
            player._hls.destroy();
          } catch (_) {}
          player._hls = null;
        }

        if (isSafariNative) {
          video.preload = isLazyTrue || isLazyMeta ? "auto" : video.preload;
          video.src = src;
          video.addEventListener(
            "loadedmetadata",
            function () {
              readyIfIdle(player, pendingPlay);
              if (updateSize === "true")
                setBeforeRatio(
                  player,
                  updateSize,
                  video.videoWidth,
                  video.videoHeight
                );
            },
            { once: true }
          );
        } else if (canUseHlsJs) {
          var hls = new Hls({ maxBufferLength: 10 });
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(src);
          });
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            readyIfIdle(player, pendingPlay);
            if (updateSize === "true") {
              var lvls = hls.levels || [];
              var best = bestLevel(lvls);
              if (best && best.width && best.height)
                setBeforeRatio(player, updateSize, best.width, best.height);
            }
          });
          player._hls = hls;
        } else {
          // Fallback if not HLS
          video.src = src;
        }
      }

      // Initialize based on lazy mode
      if (isLazyMeta) {
        if (updateSize === "true") fetchMetaOnce();
        video.preload = "none";
      } else if (isLazyTrue) {
        video.preload = "none";
      } else {
        attachMediaOnce();
      }

      // Toggle play/pause
      function togglePlay() {
        userInteracted = true;
        if (video.paused || video.ended) {
          if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce();
          pendingPlay = true;
          lastPauseBy = "";
          setStatus("loading");
          safePlay(video);
        } else {
          lastPauseBy = "manual";
          video.pause();
        }
      }

      // Toggle mute
      function toggleMute() {
        video.muted = !video.muted;
        player.setAttribute(
          "data-player-muted",
          video.muted ? "true" : "false"
        );
      }

      // Controls (delegated)
      player.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-player-control]");
        if (!btn || !player.contains(btn)) return;
        var type = btn.getAttribute("data-player-control");
        if (type === "play" || type === "pause" || type === "playpause")
          togglePlay();
        else if (type === "mute") toggleMute();
      });

      // Media event wiring
      video.addEventListener("play", function () {
        setActivated(true);
        setStatus("playing");
      });
      video.addEventListener("playing", function () {
        pendingPlay = false;
        setStatus("playing");
      });
      video.addEventListener("pause", function () {
        pendingPlay = false;
        setStatus("paused");
      });
      video.addEventListener("waiting", function () {
        setStatus("loading");
      });
      video.addEventListener("canplay", function () {
        readyIfIdle(player, pendingPlay);
      });
      video.addEventListener("ended", function () {
        pendingPlay = false;
        setStatus("paused");
        setActivated(false);
      });

      // Ensure aspect ratio updates as soon as real dimensions exist (lazy=true path included)
      var ratioSet = false;
      function maybeSetRatioOnce() {
        if (ratioSet || updateSize !== "true") return;
        var before = player.querySelector("[data-player-before]");
        if (!before) return;
        if (video.videoWidth && video.videoHeight) {
          before.style.paddingTop =
            (video.videoHeight / video.videoWidth) * 100 + "%";
          ratioSet = true;
        }
      }
      video.addEventListener("loadedmetadata", function () {
        maybeSetRatioOnce();
      });
      video.addEventListener("loadeddata", function () {
        maybeSetRatioOnce();
      });
      video.addEventListener("playing", function () {
        maybeSetRatioOnce();
      });

      // Hover (basic: active on enter, idle on leave)
      function setHover(state) {
        if (player.getAttribute("data-player-hover") !== state) {
          player.setAttribute("data-player-hover", state);
        }
      }
      player.addEventListener("pointerenter", function () {
        setHover("active");
      });
      player.addEventListener("pointerleave", function () {
        setHover("idle");
      });

      // In-view auto play/pause (only when autoplay is true)
      if (autoplay) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              var inView = entry.isIntersecting && entry.intersectionRatio > 0;
              if (inView) {
                if ((isLazyTrue || isLazyMeta) && !isAttached)
                  attachMediaOnce();
                if (
                  lastPauseBy === "io" ||
                  (video.paused && lastPauseBy !== "manual")
                ) {
                  setStatus("loading");
                  if (video.paused) togglePlay();
                  lastPauseBy = "";
                }
              } else {
                if (!video.paused && !video.ended) {
                  lastPauseBy = "io";
                  video.pause();
                }
              }
            });
          },
          { threshold: 0.1 }
        );
        io.observe(player);
      }
    });

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

  // Helper: Ratio setter
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

  // Helper: best HLS level by resolution
  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function (a, b) {
      return (b.width || 0) > (a.width || 0) ? b : a;
    }, levels[0]);
  }

  // Helper: safe programmatic play
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === "function") p.catch(function () {});
  }

  // Helper: simple URL resolver
  function resolveUrl(base, rel) {
    try {
      return new URL(rel, base).toString();
    } catch (_) {
      return rel;
    }
  }

  // Helper: unified meta fetch (hls.js or native fetch)
  function getSourceMeta(src, useHlsJs) {
    return new Promise(function (resolve) {
      if (useHlsJs && window.Hls && Hls.isSupported()) {
        try {
          var tmp = new Hls();
          var out = { width: 0, height: 0, duration: NaN };

          tmp.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
            var lvls = (data && data.levels) || tmp.levels || [];
            var best = bestLevel(lvls);
            if (best && best.width && best.height) {
              out.width = best.width;
              out.height = best.height;
            }
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function (e, data) {
            if (data && data.details && isFinite(data.details.totalduration)) {
              out.duration = data.details.totalduration;
            }
          });
          tmp.on(Hls.Events.ERROR, function () {
            try {
              tmp.destroy();
            } catch (_) {}
            resolve(out);
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function () {
            try {
              tmp.destroy();
            } catch (_) {}
            resolve(out);
          });

          tmp.loadSource(src);
          return;
        } catch (_) {
          resolve({ width: 0, height: 0, duration: NaN });
          return;
        }
      }

      function parseMaster(masterText) {
        var lines = masterText.split(/\r?\n/);
        var bestW = 0,
          bestH = 0,
          firstMedia = null,
          lastInf = null;
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf("#EXT-X-STREAM-INF:") === 0) {
            lastInf = line;
          } else if (lastInf && line && line[0] !== "#") {
            if (!firstMedia) firstMedia = line.trim();
            var m = /RESOLUTION=(\d+)x(\d+)/.exec(lastInf);
            if (m) {
              var w = parseInt(m[1], 10),
                h = parseInt(m[2], 10);
              if (w > bestW) {
                bestW = w;
                bestH = h;
              }
            }
            lastInf = null;
          }
        }
        return { bestW: bestW, bestH: bestH, media: firstMedia };
      }
      function sumDuration(mediaText) {
        var dur = 0,
          re = /#EXTINF:([\d.]+)/g,
          m;
        while ((m = re.exec(mediaText))) dur += parseFloat(m[1]);
        return dur;
      }

      fetch(src, { credentials: "omit", cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("master");
          return r.text();
        })
        .then(function (master) {
          var info = parseMaster(master);
          if (!info.media) {
            resolve({
              width: info.bestW || 0,
              height: info.bestH || 0,
              duration: NaN,
            });
            return;
          }
          var mediaUrl = resolveUrl(src, info.media);
          return fetch(mediaUrl, { credentials: "omit", cache: "no-store" })
            .then(function (r) {
              if (!r.ok) throw new Error("media");
              return r.text();
            })
            .then(function (mediaText) {
              resolve({
                width: info.bestW || 0,
                height: info.bestH || 0,
                duration: sumDuration(mediaText),
              });
            });
        })
        .catch(function () {
          resolve({ width: 0, height: 0, duration: NaN });
        });
    });
  }
}

// Initialize Bunny HTML HLS Player (Basic)
document.addEventListener("DOMContentLoaded", function () {
  initBunnyPlayerBasic();
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
