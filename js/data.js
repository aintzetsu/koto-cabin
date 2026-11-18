/* ==========================================================================
   Koto Cabin — Architectural Cabins, SVG Illustrations & Pricing Rules
   ========================================================================== */

(function (global) {
  "use strict";

  const CABINS = [
    {
      id: "kiso",
      name: "Kiso Cedar Pavilion",
      region: "Nagano Cedar Reserve",
      category: "forest",
      hasSauna: true,
      guestsMax: 4,
      sqft: "840 sq ft",
      rate: 310,
      tags: ["Forest", "Cedar Sauna", "2 Beds"],
      description:
        "Charred yakisugi cedar pavilion cantilevered over mossy granite boulders with floor-to-ceiling sliding shoji glass and a private hinoki soaking tub."
    },
    {
      id: "moss",
      name: "Moss Ridge Loft",
      region: "Cascade Foothills",
      category: "alpine",
      hasSauna: true,
      guestsMax: 4,
      sqft: "760 sq ft",
      rate: 285,
      tags: ["Alpine", "Wood Stove", "Private Sauna"],
      description:
        "Steep A-frame timber cabin perched at 1,100m elevation featuring a suspended steel fireplace, stargazing skylight, and cedar barrel sauna."
    },
    {
      id: "birch",
      name: "Glass Birch Studio",
      region: "Hudson Valley",
      category: "lakeside",
      hasSauna: false,
      guestsMax: 2,
      sqft: "520 sq ft",
      rate: 240,
      tags: ["Lakeside", "Minimalist", "1 King"],
      description:
        "Compact mirrored-glass sanctuary tucked beside a glacial pond with custom birch joinery, vinyl listening corner, and private kayak dock."
    },
    {
      id: "fjord",
      name: "Nordic Fjord House",
      region: "Olympic Peninsula",
      category: "lakeside",
      hasSauna: true,
      guestsMax: 6,
      sqft: "1,180 sq ft",
      rate: 390,
      tags: ["Lakeside", "3 Beds", "Chef Kitchen"],
      description:
        "Board-formed concrete and Douglas fir residence overlooking misty tidewaters with wrap-around deck, outdoor cold plunge, and EV charging."
    }
  ];

  const ADDONS = [
    { id: "sauna", label: "Private Cedar Sauna & Cold Plunge Prep", price: 45, perNight: false },
    { id: "breakfast", label: "Morning Sourdough & Pour-Over Basket", price: 32, perNight: true },
    { id: "ev", label: "Dedicated Level-2 EV Charging Access", price: 15, perNight: false }
  ];

  function renderCabinSvg(cabinId) {
    if (cabinId === "moss") {
      return `
        <svg viewBox="0 0 360 200" role="img" aria-label="Moss Ridge Loft architectural elevation">
          <rect width="360" height="200" rx="10" fill="#dfe5dc"/>
          <path d="M0 160 L85 95 L165 145 L260 72 L360 148 L360 200 L0 200 Z" fill="#c6d1c3"/>
          <rect x="0" y="158" width="360" height="42" fill="#1e3a2d" opacity="0.22"/>
          <!-- A-Frame Cabin -->
          <polygon points="180,32 96,162 264,162" fill="#2d3a30"/>
          <polygon points="180,48 118,158 242,158" fill="#ebd6b0" opacity="0.92"/>
          <line x1="180" y1="48" x2="180" y2="158" stroke="#2d3a30" stroke-width="4"/>
          <line x1="138" y1="115" x2="222" y2="115" stroke="#2d3a30" stroke-width="3"/>
          <!-- Pines -->
          <polygon points="56,112 38,158 74,158" fill="#1e3a2d"/>
          <polygon points="304,96 282,158 326,158" fill="#1e3a2d"/>
        </svg>`;
    }
    if (cabinId === "birch") {
      return `
        <svg viewBox="0 0 360 200" role="img" aria-label="Glass Birch Studio architectural elevation">
          <rect width="360" height="200" rx="10" fill="#e5e9e4"/>
          <!-- Lake Reflection -->
          <rect x="0" y="150" width="360" height="50" fill="#8fa7a1" opacity="0.4"/>
          <!-- Modern Glass Box -->
          <rect x="78" y="64" width="204" height="86" rx="3" fill="#253028"/>
          <rect x="90" y="74" width="120" height="68" fill="#f3dec0"/>
          <rect x="218" y="74" width="54" height="68" fill="#3a4c3e"/>
          <line x1="150" y1="74" x2="150" y2="142" stroke="#253028" stroke-width="3.5"/>
          <rect x="66" y="58" width="228" height="8" fill="#b85a3a"/>
          <!-- Birch trunks -->
          <rect x="38" y="28" width="8" height="122" fill="#f8f6f1"/>
          <rect x="312" y="36" width="9" height="114" fill="#f8f6f1"/>
        </svg>`;
    }
    if (cabinId === "fjord") {
      return `
        <svg viewBox="0 0 360 200" role="img" aria-label="Nordic Fjord House architectural elevation">
          <rect width="360" height="200" rx="10" fill="#dde4e2"/>
          <path d="M0 130 Q90 88 185 118 T360 95 L360 154 L0 154 Z" fill="#9fb2ae" opacity="0.5"/>
          <rect x="0" y="154" width="360" height="46" fill="#5d7977" opacity="0.35"/>
          <!-- Cantilevered Timber House -->
          <rect x="58" y="72" width="244" height="72" fill="#313933"/>
          <rect x="52" y="64" width="256" height="10" fill="#1e3a2d"/>
          <rect x="72" y="84" width="90" height="52" fill="#f2d6ab"/>
          <rect x="172" y="84" width="60" height="52" fill="#f2d6ab"/>
          <rect x="242" y="84" width="46" height="52" fill="#b85a3a"/>
          <rect x="44" y="144" width="272" height="10" fill="#6d513b"/>
        </svg>`;
    }
    // Kiso Cedar Pavilion (default)
    return `
      <svg viewBox="0 0 360 200" role="img" aria-label="Kiso Cedar Pavilion architectural elevation">
        <rect width="360" height="200" rx="10" fill="#e6e1d5"/>
        <circle cx="290" cy="52" r="22" fill="#b85a3a" opacity="0.24"/>
        <!-- Forest Trees -->
        <polygon points="48,54 24,154 72,154" fill="#1e3a2d" opacity="0.82"/>
        <polygon points="316,66 290,154 342,154" fill="#1e3a2d" opacity="0.82"/>
        <!-- Pavilion -->
        <polygon points="62,82 180,44 298,82" fill="#222a23"/>
        <rect x="78" y="82" width="204" height="74" fill="#333e34"/>
        <rect x="96" y="92" width="108" height="56" fill="#f4dbb3"/>
        <line x1="132" y1="92" x2="132" y2="148" stroke="#333e34" stroke-width="3"/>
        <line x1="168" y1="92" x2="168" y2="148" stroke="#333e34" stroke-width="3"/>
        <rect x="218" y="92" width="46" height="56" fill="#b85a3a"/>
        <rect x="64" y="156" width="232" height="10" fill="#7c5c42"/>
      </svg>`;
  }

  global.KotoData = {
    CABINS: CABINS,
    ADDONS: ADDONS,
    renderCabinSvg: renderCabinSvg
  };
})(window);
