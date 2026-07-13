/* =============================================================================
   TRANG TẠO LINK MỜI - LOGIC
   - Nhập tên khách -> sinh link cá nhân hóa dạng <origin>/index.html?ten=...
   - Copy link, mở thử, chia sẻ Facebook / Zalo.
   - Chế độ hàng loạt: dán danh sách tên -> bảng link để copy từng dòng.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Xác định URL gốc của thiệp ---------- */
  function baseInviteUrl() {
    // Thư mục hiện tại + index.html (bỏ tao-link.html khỏi đường dẫn)
    var origin = window.location.origin;
    var path = window.location.pathname.replace(/[^\/]*$/, "");
    if (origin === "null" || !origin) {
      // Mở bằng file:// -> origin là "null"
      return window.location.href.replace(/[^\/]*$/, "") + "index.html";
    }
    return origin + path + "index.html";
  }

  function buildLink(name) {
    var clean = (name || "").trim();
    return baseInviteUrl() + "?ten=" + encodeURIComponent(clean);
  }

  /* ---------- Tiện ích ---------- */
  function $(id) {
    return document.getElementById(id);
  }

  var toastTl = null;
  function showToast(msg) {
    var toast = $("toast");
    if (!toast) return;
    toast.textContent = msg;
    if (window.gsap) {
      if (toastTl) toastTl.kill();
      toastTl = gsap.timeline();
      toastTl
        .to(toast, { autoAlpha: 1, y: -10, duration: 0.3, ease: "back.out(2)" })
        .to(toast, { autoAlpha: 0, y: 20, duration: 0.4, delay: 1.4, ease: "power2.in" });
    } else {
      toast.style.opacity = "1";
      setTimeout(function () {
        toast.style.opacity = "0";
      }, 1600);
    }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    // Fallback
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /* ---------- Chế độ đơn ---------- */
  var nameInput = $("guestInput");
  var preview = $("linkPreview");

  function currentLink() {
    return buildLink(nameInput ? nameInput.value : "");
  }
  function updatePreview() {
    if (preview) preview.textContent = currentLink();
  }
  if (nameInput) {
    nameInput.addEventListener("input", updatePreview);
    updatePreview();
  }

  var copyBtn = $("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      copyText(currentLink()).then(
        function () {
          showToast("Đã copy link!");
        },
        function () {
          showToast("Không copy được, hãy copy thủ công.");
        }
      );
    });
  }

  var openBtn = $("openBtn");
  if (openBtn) {
    openBtn.addEventListener("click", function () {
      window.open(currentLink(), "_blank", "noopener");
    });
  }

  var fbBtn = $("fbBtn");
  if (fbBtn) {
    fbBtn.addEventListener("click", function () {
      var url =
        "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(currentLink());
      window.open(url, "_blank", "noopener,width=640,height=640");
    });
  }

  var zaloBtn = $("zaloBtn");
  if (zaloBtn) {
    zaloBtn.addEventListener("click", function () {
      var url =
        "https://sp.zalo.me/plugins/share?url=" +
        encodeURIComponent(currentLink());
      window.open(url, "_blank", "noopener,width=640,height=640");
    });
  }

  /* ---------- Chế độ hàng loạt ---------- */
  var bulkInput = $("bulkInput");
  var bulkBtn = $("bulkBtn");
  var resultsBody = $("resultsBody");
  var resultsWrap = $("resultsWrap");

  function renderBulk() {
    if (!bulkInput || !resultsBody) return;
    var names = bulkInput.value
      .split(/[\n,;]+/)
      .map(function (s) {
        return s.trim();
      })
      .filter(function (s) {
        return s.length > 0;
      });

    resultsBody.innerHTML = "";
    if (names.length === 0) {
      if (resultsWrap) resultsWrap.style.display = "none";
      showToast("Chưa có tên nào để tạo link.");
      return;
    }

    names.forEach(function (name) {
      var link = buildLink(name);
      var tr = document.createElement("tr");

      var tdName = document.createElement("td");
      tdName.textContent = name;

      var tdLink = document.createElement("td");
      tdLink.className = "link-cell";
      tdLink.textContent = link;

      var tdAct = document.createElement("td");
      var btn = document.createElement("button");
      btn.className = "btn btn--ghost btn--sm";
      btn.type = "button";
      btn.textContent = "Copy";
      btn.addEventListener("click", function () {
        copyText(link).then(function () {
          showToast("Đã copy link cho " + name);
        });
      });
      tdAct.appendChild(btn);

      tr.appendChild(tdName);
      tr.appendChild(tdLink);
      tr.appendChild(tdAct);
      resultsBody.appendChild(tr);
    });

    if (resultsWrap) resultsWrap.style.display = "block";
    if (window.gsap) {
      gsap.from(resultsBody.querySelectorAll("tr"), {
        autoAlpha: 0,
        y: 16,
        duration: 0.4,
        stagger: 0.05,
        ease: "power2.out",
      });
    }
  }

  if (bulkBtn) bulkBtn.addEventListener("click", renderBulk);

  /* ---------- Animation vào trang ---------- */
  if (window.gsap) {
    gsap.from(".panel", {
      autoAlpha: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: "power2.out",
    });
    gsap.from([".gen__title", ".gen__sub"], {
      autoAlpha: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.12,
      ease: "power2.out",
    });
  }
})();
