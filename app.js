/*
  Biye Koro Shadi Koro.com — Static edition
  EDIT PROFILES, CONTACT DETAILS AND SECTION SETTINGS IN THIS FILE.
  No database, API, login, backend or online profile submission is used.
*/

const SITE_SETTINGS = {
  showBrides: true,
  showGrooms: true,
  administratorWhatsApp: "+8801928860786", // Replace with your WhatsApp number, including country code
  administratorEmail: "kh4892001@gmail.com" // Replace with your email address
};

// Add, edit or remove profiles directly in this array.
// Photo paths should point to image files inside the project, e.g. "images/ayesha.jpg".
const PROFILES = [
  {
    id: 1, type: "bride", name: "Tamanna Vat", age: 24, height: "5'3\"",
    district: "Delhi", education: "BBA", profession: "Actor",
    marital: "Never married", family: "Educated, close-knit family",
    about: "A warm, thoughtful person who values kindness, family and lifelong learning. Enjoys reading, travel and spending time with loved ones.",
    preference: "Kind, respectful, emotionally mature and family-oriented. Stable career and a willingness to grow together.",
    photo: "tamannavat.jpg", income: "Not specified"
  },
  {
    id: 2, type: "bride", name: "Laila", age: 19, height: "5'4\"",
    district: "Chuadanga", education: "Hsc", profession: "Student",
    marital: "Never married", family: "Supportive professional Rich family",
    about: "Curious, compassionate and career-minded. Believes a good relationship is built on mutual respect and honest communication.",
    preference: "Educated, responsible and supportive of each other's ambitions.",
    photo: "morium.jpg", income: "Not specified"
  },
  {
    id: 3, type: "bride", name: "Maliha Islam", age: 23, height: "5'2\"",
    district: "Sylhet", education: "Honours", profession: "Entrepreneur",
    marital: "Never married", family: "Small, supportive family",
    about: "Creative and independent. Loves design, cooking and exploring new ideas.",
    preference: "A sincere, patient partner with a positive outlook and respect for family.",
    photo: "", income: "Not specified"
  },
  {
    id: 4, type: "groom", name: "Arif Hasan", age: 28, height: "5'9\"",
    district: "Dhaka", education: "MBA", profession: "Software Engineer",
    marital: "Never married", family: "Respectful, middle-class family",
    about: "Practical, calm and curious. Enjoys technology, fitness and meaningful conversations.",
    preference: "Kind, honest and communicative. Values mutual respect and shared decision-making.",
    photo: "", income: "৳80,000–100,000"
  },
  {
    id: 5, type: "groom", name: "Sakib Ahmed", age: 30, height: "5'10\"",
    district: "Rajshahi", education: "MBBS", profession: "Physician",
    marital: "Never married", family: "Educated family",
    about: "Compassionate and family-oriented. Enjoys travelling and volunteering when time allows.",
    preference: "Understanding, respectful and supportive of a balanced family and professional life.",
    photo: "", income: "৳100,000–150,000"
  },
  {
    id: 6, type: "groom", name: "Fahim Chowdhury", age: 27, height: "5'8\"",
    district: "Sylhet", education: "BSc", profession: "Business Owner",
    marital: "Never married", family: "Established family business",
    about: "Ambitious but grounded. Values honesty, personal growth and time with family.",
    preference: "Friendly, thoughtful and open-minded. Wants to build a partnership based on trust.",
    photo: "", income: "৳70,000–90,000"
  }
];

const $ = id => document.getElementById(id);
const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[ch]));

let currentType = "bride";
let favorites = new Set();
try { favorites = new Set(JSON.parse(localStorage.getItem("bks_static_favorites") || "[]")); } catch {}

function visibleProfiles() {
  return PROFILES.filter(p =>
    (p.type === "bride" && SITE_SETTINGS.showBrides) ||
    (p.type === "groom" && SITE_SETTINGS.showGrooms)
  );
}

function updateCounts() {
  $("brideCount").textContent = PROFILES.filter(p => p.type === "bride").length;
  $("groomCount").textContent = PROFILES.filter(p => p.type === "groom").length;
  $("favoriteCount").textContent = favorites.size;
  $("year").textContent = new Date().getFullYear();
  $("contactButton").href = SITE_SETTINGS.administratorWhatsApp.includes("X")
    ? `mailto:${encodeURIComponent(SITE_SETTINGS.administratorEmail)}`
    : `https://wa.me/${SITE_SETTINGS.administratorWhatsApp}`;
  $("contactButton").target = "_blank";
  $("contactButton").rel = "noopener";
  document.querySelector('[data-type="bride"]').classList.toggle("hidden", !SITE_SETTINGS.showBrides);
  document.querySelector('[data-type="groom"]').classList.toggle("hidden", !SITE_SETTINGS.showGrooms);
  if (currentType === "bride" && !SITE_SETTINGS.showBrides) currentType = "groom";
  if (currentType === "groom" && !SITE_SETTINGS.showGrooms) currentType = "bride";
  if (!SITE_SETTINGS.showBrides && !SITE_SETTINGS.showGrooms) {
    currentType = "favorites";
  }
}

function fillFilters() {
  const source = currentType === "favorites"
    ? visibleProfiles().filter(p => favorites.has(p.id))
    : visibleProfiles().filter(p => p.type === currentType);
  const districts = [...new Set(source.map(p => p.district).filter(Boolean))].sort();
  const education = [...new Set(source.map(p => p.education).filter(Boolean))].sort();
  $("districtFilter").innerHTML = '<option value="">All districts</option>' +
    districts.map(v => `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join("");
  $("educationFilter").innerHTML = '<option value="">All education</option>' +
    education.map(v => `<option value="${escapeHTML(v)}">${escapeHTML(v)}</option>`).join("");
}

function render() {
  const query = $("searchInput").value.trim().toLowerCase();
  const district = $("districtFilter").value;
  const education = $("educationFilter").value;
  const ageRange = $("ageFilter").value;
  const marital = $("maritalFilter").value;

  let list = visibleProfiles();
  if (currentType === "favorites") list = list.filter(p => favorites.has(p.id));
  else list = list.filter(p => p.type === currentType);

  list = list.filter(p => {
    const haystack = [p.name, p.district, p.profession, p.education].join(" ").toLowerCase();
    let ageMatches = true;
    if (ageRange) {
      const [min, max] = ageRange.split("-").map(Number);
      ageMatches = p.age >= min && p.age <= max;
    }
    return (!query || haystack.includes(query)) &&
      (!district || p.district === district) &&
      (!education || p.education === education) &&
      ageMatches && (!marital || p.marital === marital);
  });

  $("resultCount").textContent = `${list.length} ${list.length === 1 ? "profile" : "profiles"}`;
  $("profileGrid").innerHTML = list.map(p => `
    <article class="profile-card">
      <div class="profile-visual ${p.type}">
        <button class="fav-btn ${favorites.has(p.id) ? "saved" : ""}" data-fav="${p.id}" aria-label="Save ${escapeHTML(p.name)}">${favorites.has(p.id) ? "♥" : "♡"}</button>
        ${p.photo ? `<img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.name)}" loading="lazy">` : `<div class="avatar">${p.type === "bride" ? "👩🏻" : "👨🏻"}</div>`}
      </div>
      <div class="profile-info">
        <h3>${escapeHTML(p.name)}</h3>
        <div class="profile-sub">${escapeHTML(p.profession)} · ${escapeHTML(p.district)}</div>
        <div class="meta"><span>${p.age} years</span><span>${escapeHTML(p.height)}</span><span>${escapeHTML(p.education)}</span></div>
        <div class="card-bottom"><small>${escapeHTML(p.marital)}</small><button class="view-btn" data-view="${p.id}">View profile ↗</button></div>
      </div>
    </article>`).join("");

  $("emptyState").classList.toggle("hidden", list.length !== 0);
  $("profileGrid").classList.toggle("hidden", list.length === 0);
  $("favoriteCount").textContent = favorites.size;
}

function clearFilters() {
  ["searchInput", "districtFilter", "educationFilter", "ageFilter", "maritalFilter"].forEach(id => $(id).value = "");
  fillFilters();
  render();
}

function selectType(type) {
  currentType = type;
  document.querySelectorAll(".type-tab").forEach(button =>
    button.classList.toggle("active", button.dataset.type === type));
  clearFilters();
}

function openProfile(id) {
  const p = PROFILES.find(profile => profile.id === Number(id));
  if (!p) return;
  const photo = p.photo
    ? `<img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.name)}">`
    : (p.type === "bride" ? "👩🏻" : "👨🏻");
  const contactLink = SITE_SETTINGS.administratorWhatsApp.includes("X")
    ? `mailto:${encodeURIComponent(SITE_SETTINGS.administratorEmail)}`
    : `https://wa.me/${SITE_SETTINGS.administratorWhatsApp}?text=${encodeURIComponent(`Hello, I am interested in profile ${p.name} (ID: ${p.id}).`)}`;
  $("modalContent").innerHTML = `
    <div class="modal-photo">${photo}</div>
    <div class="modal-tag">${p.type.toUpperCase()} PROFILE · ID ${p.id}</div>
    <h2 id="modalName">${escapeHTML(p.name)}</h2>
    <p class="modal-lead">${p.age} years · ${escapeHTML(p.height)} · ${escapeHTML(p.district)}</p>
    <div class="detail-grid">
      <div class="detail-item"><span>Education</span><strong>${escapeHTML(p.education)}</strong></div>
      <div class="detail-item"><span>Profession</span><strong>${escapeHTML(p.profession)}</strong></div>
      <div class="detail-item"><span>Marital status</span><strong>${escapeHTML(p.marital)}</strong></div>
      <div class="detail-item"><span>Family background</span><strong>${escapeHTML(p.family)}</strong></div>
      <div class="detail-item"><span>Income</span><strong>${escapeHTML(p.income || "Not specified")}</strong></div>
      <div class="detail-item"><span>Profile type</span><strong>${p.type === "bride" ? "Bride" : "Groom"}</strong></div>
    </div>
    <div class="modal-section"><h3>About</h3><p>${escapeHTML(p.about)}</p></div>
    <div class="modal-section"><h3>Expected partner</h3><p>${escapeHTML(p.preference)}</p></div>
    <div class="modal-contact"><a href="${contactLink}" target="_blank" rel="noopener">Contact administrator ↗</a></div>`;
  $("profileModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("profileModal").classList.add("hidden");
  document.body.style.overflow = "";
}

document.querySelectorAll(".type-tab").forEach(button =>
  button.addEventListener("click", () => selectType(button.dataset.type)));

["searchInput", "districtFilter", "educationFilter", "ageFilter", "maritalFilter"].forEach(id =>
  $(id).addEventListener(id === "searchInput" ? "input" : "change", render));

$("resetFilters").addEventListener("click", clearFilters);
$("emptyReset").addEventListener("click", clearFilters);

$("profileGrid").addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-fav]");
  const viewButton = event.target.closest("[data-view]");
  if (favoriteButton) {
    const id = Number(favoriteButton.dataset.fav);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    localStorage.setItem("bks_static_favorites", JSON.stringify([...favorites]));
    render();
  }
  if (viewButton) openProfile(viewButton.dataset.view);
});

$("modalClose").addEventListener("click", closeModal);
$("profileModal").addEventListener("click", event => {
  if (event.target === $("profileModal")) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

$("menuToggle").addEventListener("click", () => {
  document.querySelector(".main-nav").classList.toggle("open");
});
document.querySelectorAll(".main-nav a").forEach(link =>
  link.addEventListener("click", () => document.querySelector(".main-nav").classList.remove("open")));

updateCounts();
fillFilters();
selectType(currentType);
