/* =============================================================================
   LỚP "ĐIỆN ẢNH" — điều phối trải nghiệm kiểu phim hoạt hình.
   - Intro tự chạy (màn nhung + title card + Lottie confetti) rồi mở ra thiệp.
   - Nhân vật cử nhân (mascot SVG) vẫy tay / idle / tung mũ theo scroll.
   - Lottie theo scene: cúp build-up scrub theo cuộn, pháo giấy khi ăn mừng.
   - Chạy ĐỘC LẬP với invitation.js (chỉ lắng nghe #invite mở ra), có fallback
     đầy đủ khi thiếu GSAP / lottie / ScrollTrigger, tôn trọng reduced-motion.
   ========================================================================== */
(function () {
  "use strict";

  var hasGSAP = typeof window.gsap !== "undefined";
  var hasLottie = typeof window.lottie !== "undefined";
  var hasScrollTrigger = typeof window.ScrollTrigger !== "undefined";
  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var intro = document.getElementById("cinemaIntro");
  var skipBtn = document.getElementById("skipIntro");
  var mascot = document.getElementById("mascot");
  var invite = document.getElementById("invite");

  var introTl = null;
  var introAnim = null;
  var lbTop = null;
  var lbBottom = null;

  /* ---------- Nạp một hoạt hình Lottie (trả null nếu lỗi) ---------- */
  function loadLottie(id, file, opts) {
    var el = document.getElementById(id);
    if (!hasLottie || !el) {
      if (el) el.style.display = "none";
      return null;
    }
    try {
      var cfg = {
        container: el,
        renderer: "svg",
        loop: false,
        autoplay: false,
        path: "assets/lottie/" + file,
      };
      if (opts) {
        for (var k in opts) {
          if (Object.prototype.hasOwnProperty.call(opts, k)) cfg[k] = opts[k];
        }
      }
      return lottie.loadAnimation(cfg);
    } catch (e) {
      el.style.display = "none";
      return null;
    }
  }

  /* =========================================================================
     INTRO ĐIỆN ẢNH
     ====================================================================== */
  function killIntro() {
    if (introTl) {
      try { introTl.kill(); } catch (e) {}
      introTl = null;
    }
    if (introAnim) {
      try { introAnim.destroy(); } catch (e) {}
      introAnim = null;
    }
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
  }

  function makeLetterbox() {
    lbTop = document.createElement("div");
    lbTop.className = "letterbox letterbox--top";
    lbBottom = document.createElement("div");
    lbBottom.className = "letterbox letterbox--bottom";
    document.body.appendChild(lbTop);
    document.body.appendChild(lbBottom);
  }

  // Sau intro: thanh letterbox lướt vào rồi thu lại như chuyển cảnh phim.
  function letterboxWipe() {
    if (!hasGSAP) return;
    makeLetterbox();
    gsap
      .timeline()
      .to([lbTop, lbBottom], { height: "6vh", duration: 0.5, ease: "power2.out" })
      .to([lbTop, lbBottom], {
        height: 0,
        duration: 0.7,
        delay: 1.1,
        ease: "power2.inOut",
        onComplete: function () {
          if (lbTop && lbTop.parentNode) lbTop.parentNode.removeChild(lbTop);
          if (lbBottom && lbBottom.parentNode) lbBottom.parentNode.removeChild(lbBottom);
        },
      });
  }

  function finishIntro() {
    if (introAnim) {
      try { introAnim.destroy(); } catch (e) {}
      introAnim = null;
    }
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
    letterboxWipe();
  }

  function runIntro() {
    if (!intro) return;

    // Reduced-motion hoặc thiếu GSAP: bỏ intro, để lộ phong bì dùng ngay.
    if (reduceMotion || !hasGSAP) {
      if (intro.parentNode) intro.parentNode.removeChild(intro);
      return;
    }

    introAnim = loadLottie("introLottie", "confetti.json", {
      loop: true,
      autoplay: true,
    });

    var card = intro.querySelector(".intro-titlecard");
    var cTop = intro.querySelector(".curtain--top");
    var cBottom = intro.querySelector(".curtain--bottom");

    gsap.set(card, { autoAlpha: 0, scale: 0.82, y: 20 });

    introTl = gsap.timeline({ onComplete: finishIntro });
    introTl
      .to(card, { autoAlpha: 1, scale: 1, y: 0, duration: 1.0, ease: "power3.out" })
      .to({}, { duration: 1.1 }) // giữ khung title
      .to(card, { autoAlpha: 0, y: -20, duration: 0.6, ease: "power2.in" })
      .to(cTop, { yPercent: -100, duration: 0.9, ease: "power3.inOut" }, "<")
      .to(cBottom, { yPercent: 100, duration: 0.9, ease: "power3.inOut" }, "<")
      .to(
        intro,
        { autoAlpha: 0, duration: 0.5 },
        "-=0.2"
      );
  }

  if (skipBtn) {
    skipBtn.addEventListener("click", function () {
      killIntro();
      letterboxWipe();
    });
  }

  /* =========================================================================
     MASCOT CỬ NHÂN
     ====================================================================== */
  var mascotShown = false;
  function showMascot() {
    if (mascotShown || !mascot || reduceMotion || !hasGSAP) return;
    mascotShown = true;
    mascot.style.display = "";

    var svg = mascot.querySelector("svg");
    var arm = mascot.querySelector(".mascot__arm");
    var tassel = mascot.querySelector(".mascot__tassel");

    gsap.fromTo(
      mascot,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 0.6, ease: "back.out(1.6)" }
    );

    // Nhún nhẹ vô hạn (trên phần svg để không đụng tween mở mascot)
    if (svg) {
      gsap.to(svg, {
        y: -8,
        duration: 1.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.6,
      });
    }
    // Vẫy tay chào khi vừa xuất hiện
    if (arm) {
      gsap.fromTo(
        arm,
        { rotation: 0 },
        {
          rotation: 26,
          transformOrigin: "50% 90%",
          duration: 0.4,
          repeat: 5,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.6,
        }
      );
    }
    // Dây tua đung đưa nhẹ
    if (tassel) {
      gsap.to(tassel, {
        rotation: 9,
        transformOrigin: "99px 50px",
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }

  function capToss() {
    if (!mascot || reduceMotion || !hasGSAP) return;
    var board = mascot.querySelector(".mascot__board");
    if (!board) return;
    gsap
      .timeline()
      .to(board, {
        y: -70,
        rotation: 35,
        transformOrigin: "50% 50%",
        duration: 0.5,
        ease: "power2.out",
      })
      .to(board, {
        y: 0,
        rotation: 0,
        duration: 0.7,
        ease: "bounce.out",
      }, "+=0.15");
  }

  /* =========================================================================
     LOTTIE THEO SCENE
     ====================================================================== */
  function setupScenes() {
    if (reduceMotion) {
      // Ẩn các khung Lottie để không chừa khoảng trống
      ["introLottie", "lottieTrophy", "lottieCelebrate"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = "none";
      });
      return;
    }

    // Cúp danh dự "dựng dần" theo cuộn (scrub) trong phần thông tin buổi lễ
    var trophy = loadLottie("lottieTrophy", "celebrate-trophy.json", {
      loop: false,
      autoplay: false,
    });
    if (trophy) {
      if (hasScrollTrigger) {
        trophy.addEventListener("DOMLoaded", function () {
          var total = trophy.totalFrames || 71;
          ScrollTrigger.create({
            trigger: "#eventSection",
            start: "top 82%",
            end: "bottom 45%",
            scrub: true,
            onUpdate: function (self) {
              trophy.goToAndStop(self.progress * (total - 1), true);
            },
          });
          ScrollTrigger.refresh();
        });
      } else {
        trophy.loop = true;
        trophy.play();
      }
    }

    // Pháo giấy khi tới phần ăn mừng
    var celeb = loadLottie("lottieCelebrate", "confetti-cannon.json", {
      loop: true,
      autoplay: false,
    });
    if (celeb) {
      if (hasScrollTrigger) {
        ScrollTrigger.create({
          trigger: "#celebrateSection",
          start: "top 75%",
          onEnter: function () {
            try { celeb.goToAndPlay(0, true); } catch (e) {}
            capToss();
          },
        });
      } else {
        celeb.play();
      }
    }
  }

  /* =========================================================================
     KHỞI ĐỘNG
     ====================================================================== */
  // Hiện mascot khi thiệp mở ra (invitation.js đặt aria-hidden="false")
  if (invite) {
    if (invite.getAttribute("aria-hidden") === "false") {
      showMascot();
    } else if (typeof MutationObserver !== "undefined") {
      var mo = new MutationObserver(function () {
        if (invite.getAttribute("aria-hidden") === "false") {
          mo.disconnect();
          showMascot();
        }
      });
      mo.observe(invite, { attributes: true, attributeFilter: ["aria-hidden"] });
    }
  }

  setupScenes();
  runIntro();
})();
