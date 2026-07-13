/* =============================================================================
   THIỆP MỜI TỐT NGHIỆP - LOGIC & ANIMATION (GSAP)
   - Đọc ?ten= trên URL để cá nhân hóa lời mời.
   - Đổ dữ liệu từ window.CONFIG vào thiệp.
   - Dựng timeline GSAP theo pattern gsap-skills: autoAlpha, ease tùy biến,
     gsap.timeline, gsap.context() để dọn dẹp, đăng ký plugin một lần,
     gate hiệu ứng nặng bằng gsap.matchMedia() + prefers-reduced-motion.
   - Mọi plugin cao cấp đều feature-detect bằng typeof và fallback êm nếu thiếu.
   ========================================================================== */
(function () {
  "use strict";

  var CONFIG = window.CONFIG || {};

  /* ---------- Tiện ích nhỏ ---------- */
  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value != null && value !== "") el.textContent = value;
  }
  function getGuestName() {
    try {
      var params = new URLSearchParams(window.location.search);
      var ten = (params.get("ten") || "").trim();
      return ten || "bạn";
    } catch (e) {
      return "bạn";
    }
  }

  /* ---------- Đổ dữ liệu vào thiệp ---------- */
  var guest = getGuestName();
  document.title = "Thiệp mời tốt nghiệp - Thân mời " + guest;
  setText("guestName", guest);
  setText("loiNhan", CONFIG.loiNhan);
  setText("tenChuNhan", CONFIG.tenChuNhan);
  setText("bangCap", CONFIG.bangCap);
  setText("nganh", CONFIG.nganh);
  setText("truong", CONFIG.truong);
  setText("ngayLe", CONFIG.ngayLe);
  setText("gioLe", CONFIG.gioLe);
  setText("diaDiem", CONFIG.diaDiem);

  /* ---------- Nút "Xem địa điểm" (Google Maps) ---------- */
  var mapsBtn = document.getElementById("mapsBtn");
  if (mapsBtn) {
    var diaChi = CONFIG.diaChiMaps || CONFIG.diaDiem || "";
    mapsBtn.href =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(diaChi);
  }

  /* ---------- Nút "Thêm vào lịch" (tạo file .ics) ---------- */
  (function buildCalendar() {
    var calBtn = document.getElementById("calendarBtn");
    if (!calBtn) return;
    var start = parseDateTime(CONFIG.ngayLe, CONFIG.gioLe);
    if (!start) {
      calBtn.style.display = "none";
      return;
    }
    var hours = Number(CONFIG.thoiLuongGio) || 2;
    var end = new Date(start.getTime() + hours * 3600 * 1000);
    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ThiepMoiTotNghiep//VI",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@thiepmoi",
      "DTSTAMP:" + toICSDate(new Date()),
      "DTSTART:" + toICSDate(start),
      "DTEND:" + toICSDate(end),
      "SUMMARY:Lễ tốt nghiệp - " + (CONFIG.tenChuNhan || ""),
      "LOCATION:" + ((CONFIG.diaDiem || "") + "").replace(/,/g, "\\,"),
      "DESCRIPTION:" + ((CONFIG.loiNhan || "") + "").replace(/,/g, "\\,"),
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    calBtn.href =
      "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  })();

  function parseDateTime(dateStr, timeStr) {
    if (!dateStr) return null;
    var d = String(dateStr).split(/[\/\-.]/).map(Number);
    if (d.length < 3 || d.some(isNaN)) return null;
    var t = String(timeStr || "08:00").split(":").map(Number);
    var hh = isNaN(t[0]) ? 8 : t[0];
    var mm = isNaN(t[1]) ? 0 : t[1];
    // d = [dd, mm, yyyy]
    return new Date(d[2], d[1] - 1, d[0], hh, mm, 0);
  }
  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function toICSDate(dt) {
    return (
      dt.getFullYear() +
      pad(dt.getMonth() + 1) +
      pad(dt.getDate()) +
      "T" +
      pad(dt.getHours()) +
      pad(dt.getMinutes()) +
      "00"
    );
  }

  /* =========================================================================
     ANIMATION GSAP — feature-detect từng plugin
     ====================================================================== */
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  var hasMotionPath = typeof window.MotionPathPlugin !== "undefined";
  var hasSplitText = typeof window.SplitText !== "undefined";
  var hasCustomEase = typeof window.CustomEase !== "undefined";
  var hasDrawSVG = typeof window.DrawSVGPlugin !== "undefined";
  var hasFlip = typeof window.Flip !== "undefined";
  var hasScrollSmoother = typeof window.ScrollSmoother !== "undefined";
  var hasObserver = typeof window.Observer !== "undefined";
  var hasDraggable = typeof window.Draggable !== "undefined";
  var hasInertia = typeof window.InertiaPlugin !== "undefined";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (hasGSAP) {
    if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (hasMotionPath) gsap.registerPlugin(MotionPathPlugin);
    if (hasSplitText) gsap.registerPlugin(SplitText);
    if (hasCustomEase) gsap.registerPlugin(CustomEase);
    if (hasDrawSVG) gsap.registerPlugin(DrawSVGPlugin);
    if (hasFlip) gsap.registerPlugin(Flip);
    if (hasScrollSmoother) gsap.registerPlugin(ScrollSmoother);
    if (hasObserver) gsap.registerPlugin(Observer);
    if (hasDraggable) gsap.registerPlugin(Draggable);
    if (hasInertia) gsap.registerPlugin(InertiaPlugin);
  }

  /* ---------- CustomEase: đường cong chữ ký "paper" dùng chung ---------- */
  // Nếu có CustomEase thì tạo ease riêng cho cả nắp phong bì và thiệp trượt vào,
  // để chuyển động cảm giác đồng bộ. Không có thì lui về "power3.out".
  var PAPER_EASE = "power3.out";
  if (hasCustomEase) {
    try {
      CustomEase.create("paper", "M0,0 C0.2,0.9 0.3,1 1,1");
      PAPER_EASE = "paper";
    } catch (e) {
      PAPER_EASE = "power3.out";
    }
  }

  var invite = document.getElementById("invite");
  var envelopeScene = document.getElementById("envelopeScene");
  var opened = false;

  /* ---------- Không có GSAP: hiển thị tĩnh, vẫn dùng được ---------- */
  if (!hasGSAP) {
    if (envelopeScene) envelopeScene.style.display = "none";
    if (invite) invite.setAttribute("aria-hidden", "false");
    revealSignatureFallback();
    return;
  }

  /* ---------- ScrollSmoother (chỉ desktop, tôn trọng reduced-motion) ------- */
  var smoother = null;
  var mm = gsap.matchMedia();
  if (hasScrollSmoother && hasScrollTrigger && !reduceMotion) {
    mm.add("(min-width: 768px)", function () {
      smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.2,
        effects: true, // bật parallax qua data-speed
        normalizeScroll: false,
      });
      return function () {
        // cleanup khi rời khỏi breakpoint
        if (smoother) {
          smoother.kill();
          smoother = null;
        }
      };
    });
  }

  // Khai báo sớm để buildParticles() (chạy trong gsap.context bên dưới) thấy được.
  var fxLayer = document.getElementById("fxLayer");
  var COLORS = ["#c9a24b", "#e4c877", "#f3d98b", "#f6f1e7", "#ffffff"];

  var ctx = gsap.context(function () {
    // Trạng thái ban đầu cho các phần nội dung
    gsap.set(
      [
        "#eyebrow",
        "#guestName",
        ".divider",
        "#loiNhan",
        ".host-block",
        ".section-title",
        ".event-item",
        "#celebrateTitle",
        ".celebrate-sub",
        ".invite__actions",
        ".signature-wrap",
      ],
      { autoAlpha: 0, y: 26 }
    );

    // Đường DrawSVG khởi tạo ở trạng thái chưa vẽ
    if (hasDrawSVG) {
      gsap.set([".divider__line", ".divider__cap-path", ".signature-path"], {
        drawSVG: "0%",
      });
    }

    buildParticles();
  });

  /* =========================================================================
     MỞ THIỆP — Flip morph phong bì -> thiệp (feature-detect)
     ====================================================================== */
  function openInvitation() {
    if (opened) return;
    opened = true;

    // Ngắt Draggable/Observer để không kích hoạt lại
    if (dragInstance) {
      try { dragInstance[0].disable(); } catch (e) {}
    }
    if (observerInstance) {
      try { observerInstance.disable(); } catch (e) {}
    }

    var seal = document.getElementById("waxSeal");
    var crest = document.getElementById("inviteCrest");

    // Đường Flip: chụp state con dấu -> hiện thiệp -> morph con dấu sang crest.
    if (hasFlip && seal && crest && !reduceMotion) {
      var state = Flip.getState(seal);

      // Hiện thiệp trước để crest có vị trí trong layout
      if (invite) invite.setAttribute("aria-hidden", "false");
      crest.style.display = "";

      // Chuyển "danh tính" Flip: ẩn seal gốc, dùng crest làm đích
      seal.setAttribute("data-flip-id", "seal");
      crest.setAttribute("data-flip-id", "seal");

      var flapEl = document.querySelector(".envelope-flap");
      var tlFlip = gsap.timeline({ onComplete: revealContent });

      if (flapEl) {
        tlFlip.to(flapEl, {
          rotationX: -170,
          duration: 0.6,
          transformOrigin: "top center",
          ease: PAPER_EASE,
        });
      }

      // Ẩn phong bì, morph seal -> crest
      tlFlip.add(function () {
        Flip.from(state, {
          targets: crest,
          absolute: true,
          duration: 0.9,
          ease: PAPER_EASE,
          scale: true,
        });
        gsap.to(envelopeScene, {
          autoAlpha: 0,
          duration: 0.5,
          onComplete: function () {
            if (envelopeScene) envelopeScene.style.display = "none";
          },
        });
      });
    } else {
      // Fallback: mở kiểu cũ (lật nắp + trượt phong bì + cross-fade)
      var tlOpen = gsap.timeline({
        defaults: { ease: PAPER_EASE },
        onComplete: revealContent,
      });
      var flap = document.querySelector(".envelope-flap");
      if (flap && !reduceMotion) {
        tlOpen.to(flap, { rotationX: -170, duration: 0.7, transformOrigin: "top center" });
      }
      tlOpen.to(".envelope", { y: -30, scale: 0.92, duration: 0.5 }, "-=0.3");
      tlOpen.to(
        envelopeScene,
        {
          autoAlpha: 0,
          duration: 0.6,
          onComplete: function () {
            if (envelopeScene) envelopeScene.style.display = "none";
          },
        },
        "-=0.1"
      );
      if (crest) crest.style.display = "";
      if (invite) invite.setAttribute("aria-hidden", "false");
    }
  }

  /* ---------- Reveal nội dung thiệp ---------- */
  function revealContent() {
    if (smoother) ScrollTrigger.refresh();

    var tl = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.7 } });

    tl.to("#eyebrow", { autoAlpha: 1, y: 0 });

    // Tên khách: tách ký tự bằng SplitText nếu có
    var guestEl = document.getElementById("guestName");
    if (hasSplitText && guestEl && !reduceMotion) {
      var split = new SplitText(guestEl, { type: "chars" });
      gsap.set(guestEl, { autoAlpha: 1, y: 0 });
      tl.from(
        split.chars,
        { autoAlpha: 0, y: 40, rotateX: -90, stagger: 0.04, duration: 0.7 },
        "-=0.3"
      );
    } else {
      tl.to("#guestName", { autoAlpha: 1, y: 0 }, "-=0.3");
    }

    tl.to(".divider", { autoAlpha: 1, y: 0 }, "-=0.2");
    // Vẽ đường phân cách DrawSVG cùng lúc
    if (hasDrawSVG && !reduceMotion) {
      tl.to(
        [".divider__line", ".divider__cap-path"],
        { drawSVG: "100%", duration: 0.9, stagger: 0.08, ease: "power1.inOut" },
        "-=0.4"
      );
    } else {
      revealDividerFallback();
    }

    tl.to("#loiNhan", { autoAlpha: 1, y: 0 }, "-=0.3")
      .to(".host-block", { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.1");

    // Mũ cử nhân bay theo MotionPath
    flyingCap();

    // Chi tiết sự kiện + ăn mừng: reveal khi cuộn tới
    setupScrollReveals();
  }

  /* ---------- Mũ cử nhân bay (MotionPath) ---------- */
  function flyingCap() {
    var cap = document.getElementById("flyingCap");
    if (!cap || reduceMotion) return;
    var w = window.innerWidth;
    var h = window.innerHeight;

    if (hasMotionPath) {
      gsap.set(cap, { autoAlpha: 1 });
      gsap.to(cap, {
        duration: 2.4,
        ease: "power1.inOut",
        motionPath: {
          path: [
            { x: w * 0.1, y: h * 0.8 },
            { x: w * 0.35, y: h * 0.25 },
            { x: w * 0.6, y: h * 0.55 },
            { x: w * 0.9, y: h * 0.12 },
          ],
          curviness: 1.4,
          autoRotate: true,
        },
        onComplete: function () {
          gsap.to(cap, { autoAlpha: 0, duration: 0.5 });
        },
      });
    } else {
      // Fallback: bay chéo đơn giản
      gsap.fromTo(
        cap,
        { autoAlpha: 0, x: w * 0.1, y: h * 0.8 },
        {
          autoAlpha: 1,
          x: w * 0.9,
          y: h * 0.15,
          rotation: 20,
          duration: 2,
          ease: "power1.inOut",
          onComplete: function () {
            gsap.to(cap, { autoAlpha: 0, duration: 0.5 });
          },
        }
      );
    }
  }

  /* ---------- Reveal theo cuộn ---------- */
  function setupScrollReveals() {
    var items = gsap.utils.toArray("[data-reveal]");
    if (hasScrollTrigger) {
      gsap.to(".section-title", {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: { trigger: "#eventSection", start: "top 80%" },
      });
      items.forEach(function (el, i) {
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          delay: i * 0.12,
          scrollTrigger: { trigger: el, start: "top 88%" },
          onStart: function () {
            // Nếu là khối chữ ký thì vẽ nét tay
            if (el.classList.contains("signature-wrap")) drawSignature();
          },
        });
      });
      gsap.to(["#celebrateTitle", ".celebrate-sub"], {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        scrollTrigger: { trigger: "#celebrateSection", start: "top 82%" },
        onStart: burstConfetti,
      });
      gsap.to(".invite__actions", {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: { trigger: ".invite__actions", start: "top 90%" },
      });
    } else {
      // Fallback: hiện tất cả
      gsap.to(
        [
          ".section-title",
          "[data-reveal]",
          "#celebrateTitle",
          ".celebrate-sub",
          ".invite__actions",
        ],
        { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.05 }
      );
      drawSignature();
    }
  }

  /* ---------- Vẽ chữ ký viết tay (DrawSVG) ---------- */
  var signatureDrawn = false;
  function drawSignature() {
    if (signatureDrawn) return;
    signatureDrawn = true;
    if (hasDrawSVG && !reduceMotion) {
      gsap.to(".signature-path", {
        drawSVG: "100%",
        duration: 1.6,
        stagger: 0.4,
        ease: "power1.inOut",
      });
    } else {
      revealSignatureFallback();
    }
  }
  function revealSignatureFallback() {
    // Không DrawSVG: ẩn SVG, hiện text thường để vẫn có chữ ký
    var svg = document.querySelector(".signature-svg");
    if (svg) svg.style.display = "none";
    var wrap = document.querySelector(".signature-wrap");
    if (wrap) gsap.set(wrap, { autoAlpha: 1, y: 0 });
  }
  function revealDividerFallback() {
    // Không DrawSVG: hiện luôn các nét (drawSVG mặc định = full khi không set)
    var svg = document.querySelector(".divider__svg");
    if (svg) svg.style.opacity = "1";
  }

  /* =========================================================================
     CONFETTI + HẠT LẤP LÁNH (fxLayer & COLORS đã khai báo phía trên)
     ====================================================================== */
  function buildParticles() {
    if (!fxLayer || reduceMotion) return;
    // Hạt lấp lánh nhấp nháy nhẹ nền
    for (var i = 0; i < 18; i++) {
      var s = document.createElement("span");
      s.className = "fx-spark";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      fxLayer.appendChild(s);
      gsap.to(s, {
        autoAlpha: gsap.utils.random(0.4, 1),
        scale: gsap.utils.random(0.6, 1.6),
        duration: gsap.utils.random(0.8, 2),
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2,
        ease: "sine.inOut",
      });
    }
  }

  function burstConfetti() {
    if (!fxLayer || reduceMotion) return;
    var pieces = [];
    for (var i = 0; i < 60; i++) {
      var d = document.createElement("span");
      d.className = "fx-dot";
      d.style.left = Math.random() * 100 + "%";
      d.style.background = COLORS[i % COLORS.length];
      fxLayer.appendChild(d);
      pieces.push(d);
    }
    gsap.set(pieces, { y: -30, autoAlpha: 1, rotation: function () {
      return gsap.utils.random(0, 360);
    } });
    gsap.to(pieces, {
      y: function () {
        return window.innerHeight + 60;
      },
      x: function () {
        return "+=" + gsap.utils.random(-120, 120);
      },
      rotation: "+=360",
      autoAlpha: 0,
      duration: function () {
        return gsap.utils.random(2.2, 4);
      },
      ease: "power1.in",
      stagger: { each: 0.02, from: "random" },
      onComplete: function () {
        pieces.forEach(function (p) {
          if (p.parentNode) p.parentNode.removeChild(p);
        });
      },
    });
  }

  /* =========================================================================
     GẮN SỰ KIỆN MỞ THIỆP
     - Tap trên #openBtn và #waxSeal (giữ nguyên).
     - Observer: vuốt lên trên #envelopeScene để mở (mobile).
     - Draggable + Inertia: kéo/peel con dấu để mở; thả giữa chừng thì bật lại.
     ====================================================================== */
  var openBtn = document.getElementById("openBtn");
  var waxSeal = document.getElementById("waxSeal");

  // Cờ để tránh xung đột: nếu vừa kéo con dấu thì bỏ qua click "ma".
  var justDragged = false;

  if (openBtn) openBtn.addEventListener("click", openInvitation);
  if (waxSeal) {
    waxSeal.addEventListener("click", function () {
      if (justDragged) {
        justDragged = false;
        return;
      }
      openInvitation();
    });
  }

  /* ---------- Observer: vuốt lên để mở ---------- */
  var observerInstance = null;
  if (hasObserver && envelopeScene) {
    observerInstance = Observer.create({
      target: envelopeScene,
      type: "touch,pointer",
      onUp: function () {
        openInvitation();
      },
      tolerance: 40,
      preventDefault: false,
    });
  }

  /* ---------- Draggable con dấu (peel để mở) ---------- */
  var dragInstance = null;
  if (hasDraggable && waxSeal && !reduceMotion) {
    var dragCfg = {
      type: "x,y",
      onDragStart: function () {
        justDragged = true;
      },
      onDrag: function () {
        // Kéo đủ xa (lên/ngang) thì coi như "peel" mở thiệp
        if (Math.abs(this.y) > 70 || Math.abs(this.x) > 90) {
          this.endDrag && this.endDrag();
          openInvitation();
        }
      },
      onDragEnd: function () {
        if (opened) return;
        // Thả giữa chừng: bật con dấu về chỗ cũ (có inertia thì mượt hơn)
        gsap.to(this.target, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
          onComplete: function () {
            justDragged = false;
          },
        });
      },
    };
    if (hasInertia) {
      dragCfg.inertia = true;
      dragCfg.snap = { x: 0, y: 0 };
    }
    dragInstance = Draggable.create(waxSeal, dragCfg);
  }

  // Cho phép mở nhanh nếu người dùng thích giảm chuyển động
  if (reduceMotion) {
    if (invite) invite.setAttribute("aria-hidden", "false");
    gsap.set(
      [
        "#eyebrow",
        "#guestName",
        ".divider",
        "#loiNhan",
        ".host-block",
        ".section-title",
        ".event-item",
        "#celebrateTitle",
        ".celebrate-sub",
        ".invite__actions",
        ".signature-wrap",
      ],
      { autoAlpha: 1, y: 0 }
    );
    revealDividerFallback();
    revealSignatureFallback();
  }
})();
