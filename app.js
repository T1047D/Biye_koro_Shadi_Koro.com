
/*
  Biye Koro Shadi Koro.com
  Complete Updated app.js
*/

const SITE_SETTINGS = {
  showBrides: true,
  showGrooms: true,
  administratorWhatsApp: "+8801928860786",
  administratorEmail: "kh4892001@gmail.com"
};

// ==========================================
// PROFILES
// ==========================================

const PROFILES = [
  {
    id: 1,
    type: "bride",
    name: "Sohana Afrin Shefa",
    age: 19,
    height: "5'15\"",
    district: "Chuadanga",
    education: "HSC",
    profession: "Bekar",
    marital: "Never married",
    family: "Educated, close-knit family",
    about: "I am a good person, hyper active, talkative, sensitive, funny.",
    preference: "Rich with six pack body, good looking, Understanding, supportive, technically a good person.",
    photo: "Assets/shefa.jpg",
    income: "00"
  },

  {
    id: 2,
    type: "groom",
    name: "Md.Kowsar",
    age: 19,
    height: "5'7\"",
    district: "Chuadanga",
    education: "HSC",
    profession: "ARMY🪖",
    marital: "Never married",
    family: "Respectful, middle-class family",
    about: "Practical, calm and curious. Enjoys technology, fitness and meaningful conversations.",
    preference: "Kind, honest and communicative. Values mutual respect and shared decision-making.",
    photo: "Assets/kowsar.jpg",
    income: "0"
  },

  {
    id: 3,
    type: "groom",
    name: "Abir Saha",
    age: 19,
    height: "5'11\"",
    district: "Chandpur",
    education: "HSC PASS",
    profession: "STUDENT",
    marital: "Unmarried / Single",
    family: "Middle-class family",
    about: "An autophile and nyctophile who loves automobiles and the beauty of the night.",
    preference: "Beautiful girl",
    photo: "Assets/abir.jpg",
    income: "Bape joto dey"
  }
];

// ==========================================
// DISTRICT OPTIONS - BANGLADESH 64 DISTRICTS
// ==========================================

const ALL_DISTRICTS = [
  "Bagerhat",
  "Bandarban",
  "Barguna",
  "Barishal",
  "Bhola",
  "Bogura",
  "Brahmanbaria",
  "Chandpur",
  "Chattogram",
  "Chuadanga",
  "Cox's Bazar",
  "Cumilla",
  "Dhaka",
  "Dinajpur",
  "Faridpur",
  "Feni",
  "Gaibandha",
  "Gazipur",
  "Gopalganj",
  "Habiganj",
  "Jamalpur",
  "Jashore",
  "Jhalokati",
  "Jhenaidah",
  "Joypurhat",
  "Khagrachhari",
  "Khulna",
  "Kishoreganj",
  "Kurigram",
  "Kushtia",
  "Lakshmipur",
  "Lalmonirhat",
  "Madaripur",
  "Magura",
  "Manikganj",
  "Meherpur",
  "Moulvibazar",
  "Munshiganj",
  "Mymensingh",
  "Naogaon",
  "Narail",
  "Narayanganj",
  "Narsingdi",
  "Natore",
  "Netrokona",
  "Nilphamari",
  "Noakhali",
  "Pabna",
  "Panchagarh",
  "Patuakhali",
  "Pirojpur",
  "Rajbari",
  "Rajshahi",
  "Rangamati",
  "Rangpur",
  "Satkhira",
  "Shariatpur",
  "Sherpur",
  "Sirajganj",
  "Sunamganj",
  "Sylhet",
  "Tangail",
  "Thakurgaon"
];

// ==========================================
// EDUCATION OPTIONS
// ==========================================

const ALL_EDUCATION = [
  "Primary",
  "JSC",
  "SSC",
  "O Level",
  "HSC",
  "A Level",
  "HSC PASS",
  "Diploma",
  "Vocational",
  "Certificate",
  "Degree",
  "Degree (Pass)",
  "Honours",
  "Bachelor's",
  "BA",
  "BSc",
  "BBA",
  "BSS",
  "LLB",
  "MBBS",
  "BDS",
  "Engineering",
  "Master's",
  "MA",
  "MSc",
  "MBA",
  "MSS",
  "LLM",
  "MPhil",
  "PhD",
  "Others"
];

// ==========================================
// COMMON FUNCTIONS
// ==========================================

const $ = id => document.getElementById(id);

const escapeHTML = value =>
  String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));

let currentType = "bride";

let favorites = new Set();

try {
  favorites = new Set(
    JSON.parse(localStorage.getItem("bks_static_favorites") || "[]")
  );
} catch {
  favorites = new Set();
}

// ==========================================
// VISIBLE PROFILES
// ==========================================

function visibleProfiles() {
  return PROFILES.filter(p =>
    (p.type === "bride" && SITE_SETTINGS.showBrides) ||
    (p.type === "groom" && SITE_SETTINGS.showGrooms)
  );
}

// ==========================================
// UPDATE COUNTS
// ==========================================

function updateCounts() {
  $("brideCount").textContent =
    PROFILES.filter(p => p.type === "bride").length;

  $("groomCount").textContent =
    PROFILES.filter(p => p.type === "groom").length;

  $("favoriteCount").textContent = favorites.size;

  $("year").textContent = new Date().getFullYear();

  $("contactButton").href =
    SITE_SETTINGS.administratorWhatsApp.includes("X")
      ? `mailto:${encodeURIComponent(SITE_SETTINGS.administratorEmail)}`
      : `https://wa.me/${SITE_SETTINGS.administratorWhatsApp}`;

  $("contactButton").target = "_blank";
  $("contactButton").rel = "noopener";

  document.querySelector('[data-type="bride"]')
    .classList.toggle("hidden", !SITE_SETTINGS.showBrides);

  document.querySelector('[data-type="groom"]')
    .classList.toggle("hidden", !SITE_SETTINGS.showGrooms);

  if (currentType === "bride" && !SITE_SETTINGS.showBrides) {
    currentType = "groom";
  }

  if (currentType === "groom" && !SITE_SETTINGS.showGrooms) {
    currentType = "bride";
  }

  if (!SITE_SETTINGS.showBrides && !SITE_SETTINGS.showGrooms) {
    currentType = "favorites";
  }
}

// ==========================================
// FILL DISTRICT AND EDUCATION FILTERS
// ==========================================

function fillFilters() {

  const source = currentType === "favorites"
    ? visibleProfiles().filter(p => favorites.has(p.id))
    : visibleProfiles().filter(p => p.type === currentType);

  const districts = [...new Set([
    ...ALL_DISTRICTS,
    ...source.map(p => p.district).filter(Boolean)
  ])].sort();

  const education = [...new Set([
    ...ALL_EDUCATION,
    ...source.map(p => p.education).filter(Boolean)
  ])].sort();

  $("districtFilter").innerHTML =
    '<option value="">All districts</option>' +
    districts.map(v =>
      `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`
    ).join("");

  $("educationFilter").innerHTML =
    '<option value="">All education</option>' +
    education.map(v =>
      `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`
    ).join("");
}

// ==========================================
// RENDER PROFILES
// ==========================================

function render() {

  const query = $("searchInput").value.trim().toLowerCase();

  const district = $("districtFilter").value;
  const education = $("educationFilter").value;
  const ageRange = $("ageFilter").value;
  const marital = $("maritalFilter").value;

  let list = visibleProfiles();

  if (currentType === "favorites") {
    list = list.filter(p => favorites.has(p.id));
  } else {
    list = list.filter(p => p.type === currentType);
  }

  list = list.filter(p => {

    const haystack = [
      p.name,
      p.district,
      p.profession,
      p.education
    ].join(" ").toLowerCase();

    let ageMatches = true;

    if (ageRange) {
      const [min, max] = ageRange.split("-").map(Number);
      ageMatches = p.age >= min && p.age <= max;
    }

    return (
      (!query || haystack.includes(query)) &&
      (!district || p.district === district) &&
      (!education || p.education === education) &&
      ageMatches &&
      (!marital || p.marital === marital)
    );
  });

  $("resultCount").textContent =
    `${list.length} ${list.length === 1 ? "profile" : "profiles"}`;

  $("profileGrid").innerHTML = list.map(p => `
    <article class="profile-card">

      <div class="profile-visual ${p.type}">

        <button
          class="fav-btn ${favorites.has(p.id) ? "saved" : ""}"
          data-fav="${p.id}"
          aria-label="Save ${escapeHTML(p.name)}"
        >
          ${favorites.has(p.id) ? "♥" : "♡"}
        </button>

        ${p.photo
          ? `<img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.name)}" loading="lazy">`
          : `<div class="avatar">${p.type === "bride" ? "👩🏻" : "👨🏻"}</div>`
        }

      </div>

      <div class="profile-info">

        <h3>${escapeHTML(p.name)}</h3>

        <div class="profile-sub">
          ${escapeHTML(p.profession)} · ${escapeHTML(p.district)}
        </div>

        <div class="meta">
          <span>${p.age} years</span>
          <span>${escapeHTML(p.height)}</span>
          <span>${escapeHTML(p.education)}</span>
        </div>

        <div class="card-bottom">
          <small>${escapeHTML(p.marital)}</small>
          <button class="view-btn" data-view="${p.id}">
            View profile ↗
          </button>
        </div>

      </div>

    </article>
  `).join("");

  $("emptyState").classList.toggle("hidden", list.length !== 0);

  $("profileGrid").classList.toggle("hidden", list.length === 0);

  $("favoriteCount").textContent = favorites.size;
}

// ==========================================
// CLEAR FILTERS
// ==========================================

function clearFilters() {

  [
    "searchInput",
    "districtFilter",
    "educationFilter",
    "ageFilter",
    "maritalFilter"
  ].forEach(id => {
    $(id).value = "";
  });

  fillFilters();
  render();
}

// ==========================================
// SELECT PROFILE TYPE
// ==========================================

function selectType(type) {

  currentType = type;

  document.querySelectorAll(".type-tab").forEach(button =>
    button.classList.toggle(
      "active",
      button.dataset.type === type
    )
  );

  clearFilters();
}

// ==========================================
// OPEN PROFILE DETAILS
// ==========================================

function openProfile(id) {

  const p = PROFILES.find(profile => profile.id === Number(id));

  if (!p) return;

  const photo = p.photo
    ? `<img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.name)}">`
    : (p.type === "bride" ? "👩🏻" : "👨🏻");

  const contactLink =
    SITE_SETTINGS.administratorWhatsApp.includes("X")
      ? `mailto:${encodeURIComponent(SITE_SETTINGS.administratorEmail)}`
      : `https://wa.me/${SITE_SETTINGS.administratorWhatsApp}?text=${encodeURIComponent(
          `Hello, I am interested in profile ${p.name} (ID: ${p.id}).`
        )}`;

  $("modalContent").innerHTML = `

    <div class="modal-photo">${photo}</div>

    <div class="modal-tag">
      ${p.type.toUpperCase()} PROFILE · ID ${p.id}
    </div>

    <h2 id="modalName">${escapeHTML(p.name)}</h2>

    <p class="modal-lead">
      ${p.age} years · ${escapeHTML(p.height)} · ${escapeHTML(p.district)}
    </p>

    <div class="detail-grid">

      <div class="detail-item">
        <span>Education</span>
        <strong>${escapeHTML(p.education)}</strong>
      </div>

      <div class="detail-item">
        <span>Profession</span>
        <strong>${escapeHTML(p.profession)}</strong>
      </div>

      <div class="detail-item">
        <span>Marital status</span>
        <strong>${escapeHTML(p.marital)}</strong>
      </div>

      <div class="detail-item">
        <span>Family background</span>
        <strong>${escapeHTML(p.family)}</strong>
      </div>

      <div class="detail-item">
        <span>Income</span>
        <strong>${escapeHTML(p.income || "Not specified")}</strong>
      </div>

      <div class="detail-item">
        <span>Profile type</span>
        <strong>${p.type === "bride" ? "Bride" : "Groom"}</strong>
      </div>

    </div>

    <div class="modal-section">
      <h3>About</h3>
      <p>${escapeHTML(p.about)}</p>
    </div>

    <div class="modal-section">
      <h3>Expected partner</h3>
      <p>${escapeHTML(p.preference)}</p>
    </div>

    <div class="modal-contact">
      <a href="${contactLink}" target="_blank" rel="noopener">
        Contact administrator ↗
      </a>
    </div>

  `;

  $("profileModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

// ==========================================
// CLOSE PROFILE MODAL
// ==========================================

function closeModal() {

  $("profileModal").classList.add("hidden");
  document.body.style.overflow = "";
}

// ==========================================
// EVENT LISTENERS
// ==========================================

// Profile type tabs

document.querySelectorAll(".type-tab").forEach(button =>
  button.addEventListener("click", () =>
    selectType(button.dataset.type)
  )
);

// Search and filters

[
  "searchInput",
  "districtFilter",
  "educationFilter",
  "ageFilter",
  "maritalFilter"
].forEach(id =>
  $(id).addEventListener(
    id === "searchInput" ? "input" : "change",
    render
  )
);

// Reset buttons

$("resetFilters").addEventListener("click", clearFilters);

$("emptyReset").addEventListener("click", clearFilters);

// Profile cards

$("profileGrid").addEventListener("click", event => {

  const favoriteButton = event.target.closest("[data-fav]");
  const viewButton = event.target.closest("[data-view]");

  if (favoriteButton) {

    const id = Number(favoriteButton.dataset.fav);

    favorites.has(id)
      ? favorites.delete(id)
      : favorites.add(id);

    localStorage.setItem(
      "bks_static_favorites",
      JSON.stringify([...favorites])
    );

    render();
  }

  if (viewButton) {
    openProfile(viewButton.dataset.view);
  }

});

// Modal controls

$("modalClose").addEventListener("click", closeModal);

$("profileModal").addEventListener("click", event => {
  if (event.target === $("profileModal")) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

// Mobile menu

$("menuToggle").addEventListener("click", () => {
  document.querySelector(".main-nav").classList.toggle("open");
});

document.querySelectorAll(".main-nav a").forEach(link =>
  link.addEventListener("click", () => {
    document.querySelector(".main-nav").classList.remove("open");
  })
);

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

updateCounts();
fillFilters();
selectType(currentType);
