/* ==========================================================================
   Koto Cabin — Interactive Booking Calculator & Trip Persistence
   ========================================================================== */

(function (global) {
  "use strict";

  const STORAGE_TRIPS = "koto_reservations";
  const CLEANING_FEE = 65;
  const TAX_RATE = 0.08;
  const Data = global.KotoData;

  function safeGet(key, fallback) {
    try {
      const v = global.localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch (_err) {
      return fallback;
    }
  }

  function safeSet(key, val) {
    try {
      global.localStorage.setItem(key, JSON.stringify(val));
    } catch (_err) {
      // Ignore storage failures
    }
  }

  function addDays(dateStr, days) {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  const state = {
    filter: "all",
    selectedCabinId: Data.CABINS[0].id,
    checkin: addDays(todayStr, 7),
    checkout: addDays(todayStr, 10),
    guests: 2,
    addons: { sauna: false, breakfast: false, ev: false },
    trips: safeGet(STORAGE_TRIPS, [])
  };

  const dom = {};

  function cacheDom() {
    dom.heroArt = document.getElementById("hero-cabin-art");
    dom.filterBtns = document.querySelectorAll("[data-cabin-filter]");
    dom.cabinGrid = document.getElementById("cabin-grid");

    dom.cabinSelect = document.getElementById("book-cabin");
    dom.checkinInput = document.getElementById("book-checkin");
    dom.checkoutInput = document.getElementById("book-checkout");
    dom.guestsInput = document.getElementById("book-guests");
    dom.addonList = document.getElementById("addon-list");
    dom.guestName = document.getElementById("book-name");
    dom.guestEmail = document.getElementById("book-email");
    dom.bookError = document.getElementById("book-error");
    dom.bookForm = document.getElementById("booking-form");
    dom.confirmBox = document.getElementById("confirm-box");

    dom.sumTitle = document.getElementById("sum-cabin-title");
    dom.sumNightsLine = document.getElementById("sum-nights-line");
    dom.sumNightsVal = document.getElementById("sum-nights-val");
    dom.sumAddonsVal = document.getElementById("sum-addons-val");
    dom.sumTaxVal = document.getElementById("sum-tax-val");
    dom.sumTotalVal = document.getElementById("sum-total-val");

    dom.tripsBtn = document.getElementById("trips-btn");
    dom.tripsCount = document.getElementById("trips-count");
    dom.tripsDrawer = document.getElementById("trips-drawer");
    dom.closeTripsBtn = document.getElementById("close-trips-btn");
    dom.tripsList = document.getElementById("trips-list");
  }

  function formatMoney(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  function getSelectedCabin() {
    return Data.CABINS.find(function (c) { return c.id === state.selectedCabinId; }) || Data.CABINS[0];
  }

  function computeNights() {
    const start = new Date(state.checkin + "T12:00:00");
    const end = new Date(state.checkout + "T12:00:00");
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) ? diff : 0;
  }

  function calculatePricing() {
    const cabin = getSelectedCabin();
    const nights = Math.max(1, computeNights());
    const stayCost = nights * cabin.rate;
    let addonsCost = 0;
    Data.ADDONS.forEach(function (a) {
      if (state.addons[a.id]) {
        addonsCost += a.perNight ? a.price * nights : a.price;
      }
    });
    const subtotal = stayCost + addonsCost + CLEANING_FEE;
    const tax = Math.round(subtotal * TAX_RATE);
    return {
      cabin: cabin,
      nights: nights,
      stayCost: stayCost,
      addonsCost: addonsCost,
      tax: tax,
      total: subtotal + tax
    };
  }

  function renderCabins() {
    const list = Data.CABINS.filter(function (c) {
      if (state.filter === "all") return true;
      if (state.filter === "sauna") return c.hasSauna;
      return c.category === state.filter;
    });

    dom.cabinGrid.innerHTML = "";
    list.forEach(function (cabin) {
      const card = document.createElement("article");
      card.className = "cabin-card";

      const art = document.createElement("div");
      art.className = "cabin-card__art";
      art.innerHTML = Data.renderCabinSvg(cabin.id);

      const top = document.createElement("div");
      top.className = "cabin-card__top";
      const h3 = document.createElement("h3");
      h3.className = "cabin-card__title";
      h3.textContent = cabin.name;
      const loc = document.createElement("span");
      loc.className = "mono";
      loc.style.fontSize = "0.76rem";
      loc.style.color = "var(--ink-muted)";
      loc.textContent = cabin.region;
      top.appendChild(h3);
      top.appendChild(loc);

      const desc = document.createElement("p");
      desc.className = "cabin-card__desc";
      desc.textContent = cabin.description;

      const tags = document.createElement("div");
      tags.className = "cabin-card__tags";
      cabin.tags.concat([cabin.sqft]).forEach(function (t) {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t;
        tags.appendChild(span);
      });

      const foot = document.createElement("div");
      foot.className = "cabin-card__foot";
      const rate = document.createElement("div");
      rate.innerHTML = "<strong class='mono' style='font-size:1.1rem;'>" + formatMoney(cabin.rate) + "</strong> <span style='font-size:0.82rem;color:var(--ink-muted);'>/ night</span>";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--primary btn--sm";
      btn.textContent = "Select & Price Stay";
      btn.addEventListener("click", function () {
        state.selectedCabinId = cabin.id;
        dom.cabinSelect.value = cabin.id;
        renderSummary();
        document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
      });

      foot.appendChild(rate);
      foot.appendChild(btn);

      card.appendChild(art);
      card.appendChild(top);
      card.appendChild(desc);
      card.appendChild(tags);
      card.appendChild(foot);
      dom.cabinGrid.appendChild(card);
    });
  }

  function renderBookingControls() {
    dom.cabinSelect.innerHTML = "";
    Data.CABINS.forEach(function (c) {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.name + " (" + formatMoney(c.rate) + "/night · max " + c.guestsMax + " guests)";
      dom.cabinSelect.appendChild(opt);
    });
    dom.cabinSelect.value = state.selectedCabinId;
    dom.checkinInput.value = state.checkin;
    dom.checkinInput.min = todayStr;
    dom.checkoutInput.value = state.checkout;
    dom.checkoutInput.min = addDays(state.checkin, 1);

    dom.addonList.innerHTML = "";
    Data.ADDONS.forEach(function (a) {
      const lbl = document.createElement("label");
      lbl.className = "addon-item";
      const left = document.createElement("span");
      left.style.display = "inline-flex";
      left.style.alignItems = "center";
      left.style.gap = "0.55rem";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = Boolean(state.addons[a.id]);
      cb.addEventListener("change", function () {
        state.addons[a.id] = cb.checked;
        renderSummary();
      });
      const name = document.createElement("span");
      name.textContent = a.label;
      left.appendChild(cb);
      left.appendChild(name);

      const price = document.createElement("span");
      price.className = "mono";
      price.textContent = "+" + formatMoney(a.price) + (a.perNight ? "/night" : "");

      lbl.appendChild(left);
      lbl.appendChild(price);
      dom.addonList.appendChild(lbl);
    });
  }

  function renderSummary() {
    const p = calculatePricing();
    dom.sumTitle.textContent = p.cabin.name + " · " + p.cabin.region;
    dom.sumNightsLine.textContent = formatMoney(p.cabin.rate) + " × " + p.nights + " night" + (p.nights > 1 ? "s" : "");
    dom.sumNightsVal.textContent = formatMoney(p.stayCost);
    dom.sumAddonsVal.textContent = formatMoney(p.addonsCost);
    dom.sumTaxVal.textContent = formatMoney(p.tax);
    dom.sumTotalVal.textContent = formatMoney(p.total);
  }

  function renderTrips() {
    dom.tripsCount.textContent = String(state.trips.length);
    dom.tripsList.innerHTML = "";

    if (state.trips.length === 0) {
      const p = document.createElement("p");
      p.style.color = "var(--ink-muted)";
      p.textContent = "No upcoming cabin stays yet. Reserve a cabin below to save your itinerary here.";
      dom.tripsList.appendChild(p);
      return;
    }

    state.trips.forEach(function (t) {
      const card = document.createElement("div");
      card.className = "trip-card";
      const code = document.createElement("span");
      code.className = "mono";
      code.style.fontSize = "0.75rem";
      code.style.color = "var(--terracotta)";
      code.textContent = t.code;

      const title = document.createElement("strong");
      title.textContent = t.cabinName;

      const dates = document.createElement("span");
      dates.className = "mono";
      dates.style.fontSize = "0.82rem";
      dates.textContent = t.checkin + " -> " + t.checkout + " (" + t.guests + " guests)";

      const foot = document.createElement("div");
      foot.style.display = "flex";
      foot.style.justifyContent = "space-between";
      foot.style.alignItems = "center";
      foot.style.marginTop = "0.35rem";
      const total = document.createElement("strong");
      total.className = "mono";
      total.textContent = formatMoney(t.total);

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "btn btn--secondary btn--sm";
      cancel.textContent = "Cancel";
      cancel.addEventListener("click", function () {
        state.trips = state.trips.filter(function (item) { return item.code !== t.code; });
        safeSet(STORAGE_TRIPS, state.trips);
        renderTrips();
      });

      foot.appendChild(total);
      foot.appendChild(cancel);
      card.appendChild(code);
      card.appendChild(title);
      card.appendChild(dates);
      card.appendChild(foot);
      dom.tripsList.appendChild(card);
    });
  }

  function bindEvents() {
    dom.filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.filter = btn.dataset.cabinFilter;
        dom.filterBtns.forEach(function (b) {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        renderCabins();
      });
    });

    dom.cabinSelect.addEventListener("change", function () {
      state.selectedCabinId = dom.cabinSelect.value;
      renderSummary();
    });

    dom.checkinInput.addEventListener("change", function () {
      state.checkin = dom.checkinInput.value;
      if (computeNights() < 1) {
        state.checkout = addDays(state.checkin, 1);
        dom.checkoutInput.value = state.checkout;
      }
      dom.checkoutInput.min = addDays(state.checkin, 1);
      renderSummary();
    });

    dom.checkoutInput.addEventListener("change", function () {
      state.checkout = dom.checkoutInput.value;
      renderSummary();
    });

    dom.guestsInput.addEventListener("change", function () {
      state.guests = Number(dom.guestsInput.value);
    });

    dom.bookForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      dom.bookError.textContent = "";
      dom.confirmBox.hidden = true;

      const nights = computeNights();
      const cabin = getSelectedCabin();
      const guestName = dom.guestName.value.trim();
      const guestEmail = dom.guestEmail.value.trim();

      if (nights < 1) {
        dom.bookError.textContent = "Check-out date must be at least 1 night after check-in.";
        return;
      }
      if (state.guests > cabin.guestsMax) {
        dom.bookError.textContent = cabin.name + " accommodates up to " + cabin.guestsMax + " guests.";
        return;
      }
      if (!guestName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
        dom.bookError.textContent = "Please enter your name and a valid email address.";
        return;
      }

      const pricing = calculatePricing();
      const code = "KOTO-" + Math.floor(10000 + Math.random() * 90000);
      state.trips.unshift({
        code: code,
        cabinName: cabin.name,
        checkin: state.checkin,
        checkout: state.checkout,
        guests: state.guests,
        total: pricing.total
      });
      safeSet(STORAGE_TRIPS, state.trips);
      renderTrips();

      dom.confirmBox.hidden = false;
      dom.confirmBox.innerHTML =
        "<strong style='color:var(--forest);'>Reservation Confirmed · " + code + "</strong>" +
        "<p style='margin:0.35rem 0 0;font-size:0.88rem;'>Itinerary saved for " +
        guestName.replace(/</g, "&lt;") + " (" + state.checkin + " to " + state.checkout + "). View anytime in My Trips.</p>";
      dom.bookForm.reset();
      dom.cabinSelect.value = state.selectedCabinId;
      dom.checkinInput.value = state.checkin;
      dom.checkoutInput.value = state.checkout;
      dom.guestsInput.value = String(state.guests);
    });

    dom.tripsBtn.addEventListener("click", function () {
      dom.tripsDrawer.classList.add("is-open");
      dom.tripsDrawer.setAttribute("aria-hidden", "false");
    });
    dom.closeTripsBtn.addEventListener("click", function () {
      dom.tripsDrawer.classList.remove("is-open");
      dom.tripsDrawer.setAttribute("aria-hidden", "true");
    });
    dom.tripsDrawer.addEventListener("click", function (ev) {
      if (ev.target === dom.tripsDrawer) {
        dom.tripsDrawer.classList.remove("is-open");
        dom.tripsDrawer.setAttribute("aria-hidden", "true");
      }
    });
  }

  function init() {
    cacheDom();
    if (dom.heroArt) dom.heroArt.innerHTML = Data.renderCabinSvg("kiso");
    renderCabins();
    renderBookingControls();
    renderSummary();
    renderTrips();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
