/* Pasticceria Viola — interazioni condivise */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu hamburger (mobile-first, con overlay e azioni) ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var navList = document.querySelector(".nav-list");
  if (toggle && navList) {
    /* Etichetta testuale "Menu / Chiudi" accanto all'icona (chiarezza) */
    var label = document.createElement("span");
    label.className = "nav-toggle-label";
    label.textContent = "Menu";
    toggle.appendChild(label);

    /* Sfondo scuro dietro il menu aperto */
    var scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    document.body.appendChild(scrim);

    /* Azioni rapide dentro il menu: ogni cosa raggiungibile in un tap */
    var actions = document.createElement("li");
    actions.className = "nav-actions";
    actions.innerHTML =
      '<a class="btn btn--primary" href="ordini-speciali.html">Ordina una torta</a>' +
      '<div class="nav-actions-row">' +
        '<a href="tel:+390255123456">Chiama</a>' +
        '<a href="https://wa.me/393401234567" rel="noopener">WhatsApp</a>' +
      '</div>';
    navList.appendChild(actions);

    function setMenu(open) {
      navList.classList.toggle("is-open", open);
      scrim.classList.toggle("is-visible", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
      label.textContent = open ? "Chiudi" : "Menu";
    }

    toggle.addEventListener("click", function () {
      setMenu(!navList.classList.contains("is-open"));
    });
    scrim.addEventListener("click", function () { setMenu(false); });
    navList.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navList.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    var deskMq = window.matchMedia("(min-width: 1024px)");
    (deskMq.addEventListener || deskMq.addListener).call(deskMq,
      deskMq.addEventListener ? "change" : undefined,
      function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Bottone "Torna su" ---------- */
  var toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Torna su");
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 15 12 9 18 15"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
  var onScroll = function () {
    toTop.classList.toggle("is-visible", window.scrollY > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal in scroll (rispetta reduced motion) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduceMotion && "IntersectionObserver" in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Filtri prodotti ---------- */
  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    var buttons = filterBar.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll("[data-cat]");
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var cat = btn.dataset.filter;
      cards.forEach(function (card) {
        var match = cat === "tutti" || card.dataset.cat.split(" ").indexOf(cat) !== -1;
        card.classList.toggle("is-hidden", !match);
      });
    });
  }

  /* ---------- Carosello galleria (coverflow) ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(track.children);
    var dotsWrap = carousel.querySelector("[data-carousel-dots]");
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    if (!slides.length) return;

    var dots = slides.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Vai alla collezione " + (i + 1));
      b.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(b);
      return b;
    });

    function goTo(i) {
      var s = slides[i];
      track.scrollTo({
        left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    }
    function activeIndex() {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestD = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }
    function update() {
      var cur = activeIndex();
      slides.forEach(function (s, i) { s.classList.toggle("is-active", i === cur); });
      dots.forEach(function (d, i) { d.classList.toggle("is-active", i === cur); });
    }

    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { update(); ticking = false; });
    }, { passive: true });

    if (prev) prev.addEventListener("click", function () { goTo(Math.max(0, activeIndex() - 1)); });
    if (next) next.addEventListener("click", function () { goTo(Math.min(slides.length - 1, activeIndex() + 1)); });

    update();
  });

  /* ---------- Validazione form ---------- */
  document.querySelectorAll("form[data-validate]").forEach(function (form) {
    form.setAttribute("novalidate", "");
    var fields = form.querySelectorAll("[required]");

    function validateField(input) {
      var field = input.closest(".field");
      if (!field) return true;
      var ok = input.checkValidity();
      field.classList.toggle("has-error", !ok);
      input.setAttribute("aria-invalid", String(!ok));
      return ok;
    }

    fields.forEach(function (input) {
      input.addEventListener("blur", function () { validateField(input); });
      input.addEventListener("input", function () {
        if (input.closest(".field").classList.contains("has-error")) validateField(input);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      /* Demo: nessun backend collegato. Mostra conferma e svuota il form. */
      var success = form.querySelector(".form-success");
      if (success) success.classList.add("is-visible");
      form.reset();
      var submitBtn = form.querySelector("[type='submit']");
      if (submitBtn) submitBtn.blur();
    });
  });

  /* ---------- Giorno corrente negli orari ---------- */
  var rows = document.querySelectorAll(".hours-table [data-day]");
  if (rows.length) {
    var today = String(new Date().getDay()); /* 0 = domenica */
    rows.forEach(function (row) {
      if (row.dataset.day === today) row.classList.add("today");
    });
  }

  /* ---------- Anno footer ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
