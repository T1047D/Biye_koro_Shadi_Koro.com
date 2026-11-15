
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.3.0/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/13.3.0/firebase-firestore.js";

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCt_mNayiIitcR0UJh-tLu7wrcV7Pcr4PQ",
  authDomain: "biye-koro-shadi-koro.firebaseapp.com",
  projectId: "biye-koro-shadi-koro",
  storageBucket: "biye-koro-shadi-koro.firebasestorage.app",
  messagingSenderId: "803109802507",
  appId: "1:803109802507:web:a3b5ef928871634a5f6d0e"
};

const ADMIN_UID = "vvaqgSUCzSXwgpNentQgEkI8m362";

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const profilesCollection = collection(db, "profiles");

// ==========================================
// SITE SETTINGS
// ==========================================

const SITE_SETTINGS = {
  showBrides: true,
  showGrooms: true,
  administratorWhatsApp: "+8801928860786",
  administratorEmail: "kh4892001@gmail.com"
};

// ==========================================
// ORIGINAL SAMPLE PROFILES
// ==========================================

const SAMPLE_PROFILES = [
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
// FILTER OPTIONS
// ==========================================

const ALL_DISTRICTS = [
  "Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura",
  "Brahmanbaria","Chandpur","Chattogram","Chuadanga","Cox's Bazar",
  "Cumilla","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha",
  "Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalokati",
  "Jhenaidah","Joypurhat","Khagrachhari","Khulna","Kishoreganj",
  "Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur",
  "Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj",
  "Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi",
  "Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh",
  "Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati",
  "Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj",
  "Sunamganj","Sylhet","Tangail","Thakurgaon"
];

const ALL_EDUCATION = [
  "Primary","JSC","SSC","O Level","HSC","A Level","HSC PASS",
  "Diploma","Vocational","Certificate","Degree","Degree (Pass)",
  "Honours","Bachelor's","BA","BSc","BBA","BSS","LLB","MBBS",
  "BDS","Engineering","Master's","MA","MSc","MBA","MSS","LLM",
  "MPhil","PhD","Others"
];

// ==========================================
// HELPERS
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

let PROFILES = [];
let currentType = "bride";
let currentUser = null;
let unsubscribeProfiles = null;

let favorites = new Set();

try {
  favorites = new Set(
    JSON.parse(localStorage.getItem("bks_static_favorites") || "[]")
  );
} catch {
  favorites = new Set();
}

// ==========================================
// PROFILE VISIBILITY
// ==========================================

function visibleProfiles() {
  return PROFILES.filter(p =>
    (p.type === "bride" && SITE_SETTINGS.showBrides) ||
    (p.type === "groom" && SITE_SETTINGS.showGrooms)
  );
}

// ==========================================
// COUNTS AND CONTACT
// ==========================================

function updateCounts() {
  $("brideCount").textContent =
    PROFILES.filter(p => p.type === "bride").length;

  $("groomCount").textContent =
    PROFILES.filter(p => p.type === "groom").length;

  $("favoriteCount").textContent = favorites.size;
  $("year").textContent = new Date().getFullYear();

  $("contactButton").href =
    `https://wa.me/${SITE_SETTINGS.administratorWhatsApp.replace(/\D/g, "")}`;

  $("contactButton").target = "_blank";
  $("contactButton").rel = "noopener";

  document.querySelector('[data-type="bride"]')
    .classList.toggle("hidden", !SITE_SETTINGS.showBrides);

  document.querySelector('[data-type="groom"]')
    .classList.toggle("hidden", !SITE_SETTINGS.showGrooms);
}

// ==========================================
// FILTER DROPDOWNS
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
      p.name, p.district, p.profession, p.education
    ].join(" ").toLowerCase();

    let ageMatches = true;

    if (ageRange) {
      const [min, max] = ageRange.split("-").map(Number);
      ageMatches = Number(p.age) >= min && Number(p.age) <= max;
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
        <button class="fav-btn ${favorites.has(p.id) ? "saved" : ""}"
          data-fav="${escapeHTML(p.id)}"
          aria-label="Save ${escapeHTML(p.name)}">
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
          <span>${escapeHTML(p.age)} years</span>
          <span>${escapeHTML(p.height)}</span>
          <span>${escapeHTML(p.education)}</span>
        </div>

        <div class="card-bottom">
          <small>${escapeHTML(p.marital)}</small>
          <button class="view-btn" data-view="${escapeHTML(p.id)}">
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
// FIRESTORE REALTIME PROFILES
// ==========================================

function startProfileListener() {
  if (unsubscribeProfiles) unsubscribeProfiles();

  unsubscribeProfiles = onSnapshot(
    profilesCollection,
    snapshot => {
      PROFILES = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      updateCounts();
      fillFilters();
      render();
      renderAdminProfiles();
    },
    error => {
      console.error("Firestore error:", error);
      alert("Could not load profiles. Please check Firestore Rules and internet connection.");
    }
  );
}

// ==========================================
// FILTER CONTROLS
// ==========================================

function clearFilters() {
  [
    "searchInput",
    "districtFilter",
    "educationFilter",
    "ageFilter",
    "maritalFilter"
  ].forEach(id => $(id).value = "");

  fillFilters();
  render();
}

function selectType(type) {
  currentType = type;

  document.querySelectorAll(".type-tab").forEach(button =>
    button.classList.toggle("active", button.dataset.type === type)
  );

  clearFilters();
}

// ==========================================
// PROFILE DETAILS
// ==========================================

function openProfile(id) {
  const p = PROFILES.find(profile => String(profile.id) === String(id));
  if (!p) return;

  const photo = p.photo
    ? `<img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.name)}">`
    : (p.type === "bride" ? "👩🏻" : "👨🏻");

  const contactLink =
    `https://wa.me/${SITE_SETTINGS.administratorWhatsApp.replace(/\D/g, "")}?text=${
      encodeURIComponent(`Hello, I am interested in profile ${p.name} (ID: ${p.id}).`)
    }`;

  $("modalContent").innerHTML = `
    <div class="modal-photo">${photo}</div>
    <div class="modal-tag">${p.type.toUpperCase()} PROFILE</div>
    <h2 id="modalName">${escapeHTML(p.name)}</h2>
    <p class="modal-lead">${escapeHTML(p.age)} years · ${escapeHTML(p.height)} · ${escapeHTML(p.district)}</p>

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

    <div class="modal-contact">
      <a href="${contactLink}" target="_blank" rel="noopener">Contact administrator ↗</a>
    </div>
  `;

  $("profileModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("profileModal").classList.add("hidden");
  document.body.style.overflow = "";
}

// ==========================================
// ADMIN LOGIN
// ==========================================

function openAdminLogin() {
  if (currentUser && currentUser.uid === ADMIN_UID) {
    $("adminDashboard").classList.remove("hidden");
    renderAdminProfiles();
  } else {
    $("adminLoginModal").classList.remove("hidden");
  }
}

function closeAdminLogin() {
  $("adminLoginModal").classList.add("hidden");
}

$("adminLoginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("adminEmail").value.trim();
  const password = $("adminPassword").value;

  $("loginMessage").textContent = "Signing in...";

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);
      $("loginMessage").textContent = "This account does not have administrator permission.";
      return;
    }

    $("adminPassword").value = "";
    $("loginMessage").textContent = "";
    closeAdminLogin();
    $("adminDashboard").classList.remove("hidden");
  } catch (error) {
    console.error(error);
    $("loginMessage").textContent =
      error.code === "auth/invalid-credential"
        ? "Incorrect email or password."
        : error.message;
  }
});

onAuthStateChanged(auth, user => {
  currentUser = user;

  if (user && user.uid === ADMIN_UID) {
    $("adminOpenBtn").textContent = "Dashboard";
  } else {
    $("adminOpenBtn").textContent = "Admin";
    if (!$("adminDashboard").classList.contains("hidden")) {
      $("adminDashboard").classList.add("hidden");
    }
  }
});

// ==========================================
// ADMIN PROFILE TABLE
// ==========================================

function renderAdminProfiles() {
  if (!$("adminProfileRows")) return;

  if (!currentUser || currentUser.uid !== ADMIN_UID) {
    $("adminProfileRows").innerHTML =
      '<tr><td colspan="5">Please login as administrator.</td></tr>';
    return;
  }

  if (PROFILES.length === 0) {
    $("adminProfileRows").innerHTML =
      '<tr><td colspan="5">No profiles yet. Add a profile or import samples.</td></tr>';
    return;
  }

  $("adminProfileRows").innerHTML = PROFILES.map(p => `
    <tr>
      <td>${escapeHTML(p.name)}</td>
      <td>${escapeHTML(p.type)}</td>
      <td>${escapeHTML(p.district)}</td>
      <td>${escapeHTML(p.age)}</td>
      <td>
        <button class="table-edit-btn" data-edit="${escapeHTML(p.id)}">Edit</button>
        <button class="table-delete-btn" data-delete="${escapeHTML(p.id)}">Delete</button>
      </td>
    </tr>
  `).join("");
}

// ==========================================
// ADMIN FORM
// ==========================================



$("profileForm").addEventListener("submit", async event => {
  event.preventDefault();

  if (!currentUser || currentUser.uid !== ADMIN_UID) {
    $("formMessage").textContent = "Administrator permission required.";
    return;
  }

  const profile = {
    type: $("formType").value,
    name: $("formName").value.trim(),
    age: Number($("formAge").value),
    height: $("formHeight").value.trim(),
    district: $("formDistrict").value.trim(),
    education: $("formEducation").value.trim(),
    profession: $("formProfession").value.trim(),
    marital: $("formMarital").value,
    family: $("formFamily").value.trim(),
    income: $("formIncome").value.trim(),
    photo: $("formPhoto").value.trim(),
    about: $("formAbout").value.trim(),
    preference: $("formPreference").value.trim()
  };

  if (profile.age < 18) {
    $("formMessage").textContent = "Profile age must be at least 18.";
    return;
  }

  const editId = $("editProfileId").value;
  $("saveProfileBtn").disabled = true;
  $("formMessage").textContent = "Saving...";

  try {
    if (editId) {
      await updateDoc(doc(db, "profiles", editId), profile);
      $("formMessage").textContent = "Profile updated successfully.";
    } else {
      await addDoc(profilesCollection, profile);
      $("formMessage").textContent = "Profile added successfully.";
    }

    resetProfileForm();
    $("profileForm").classList.add("hidden");
  } catch (error) {
    console.error(error);
    $("formMessage").textContent = "Error: " + error.message;
  } finally {
    $("saveProfileBtn").disabled = false;
  }
});

// ==========================================
// IMPORT ORIGINAL SAMPLE PROFILES
// ==========================================

$("importSamplesBtn").addEventListener("click", async () => {
  if (!currentUser || currentUser.uid !== ADMIN_UID) return;

  if (PROFILES.length > 0) {
    $("dashboardMessage").textContent =
      "Firestore already contains profiles. Import cancelled to avoid duplicates.";
    return;
  }

  const confirmed = confirm(
    "Import the 3 original sample profiles into Firestore?"
  );

  if (!confirmed) return;

  $("dashboardMessage").textContent = "Importing sample profiles...";

  try {
    for (const profile of SAMPLE_PROFILES) {
      const { id, ...data } = profile;
      await addDoc(profilesCollection, data);
    }

    $("dashboardMessage").textContent =
      "All 3 sample profiles imported successfully.";
  } catch (error) {
    console.error(error);
    $("dashboardMessage").textContent = "Import failed: " + error.message;
  }
});


/* ==========================================
   ADMIN LOGIN AND DASHBOARD
========================================== */

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.admin-open-btn {
  background: var(--wine);
  color: white;
  border: 0;
  padding: 12px 17px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.admin-open-btn:hover {
  background: var(--wine-dark);
}

.admin-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #24151ddd;
  display: grid;
  place-items: center;
  padding: 15px;
}

.admin-box,
.admin-dashboard-box {
  width: min(100%, 480px);
  max-height: 92vh;
  overflow-y: auto;
  background: var(--cream);
  padding: 30px;
  position: relative;
  border-radius: 5px;
}

.admin-box h2,
.admin-dashboard-box h2 {
  font: 600 30px "Playfair Display", serif;
  color: var(--wine);
  margin: 12px 0;
}

.admin-box > p,
.admin-dashboard-header p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--muted);
}

.admin-box form {
  display: grid;
  gap: 15px;
  margin-top: 22px;
}

.admin-box label,
.admin-profile-form label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  color: #827579;
  font-size: 11px;
  font-weight: 600;
}

.admin-box input,
.admin-profile-form input,
.admin-profile-form select,
.admin-profile-form textarea {
  width: 100%;
  border: 1px solid var(--line);
  background: white;
  padding: 12px;
  outline: none;
  color: var(--ink);
  font-size: 12px;
  border-radius: 3px;
}

.admin-box input:focus,
.admin-profile-form input:focus,
.admin-profile-form select:focus,
.admin-profile-form textarea:focus {
  border-color: var(--rose);
}

.admin-box .btn {
  width: 100%;
}

.admin-message {
  font-size: 12px;
  color: var(--wine);
  line-height: 1.6;
}

.admin-dashboard-box {
  width: min(100%, 1000px);
}

.admin-dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--line);
  padding-bottom: 18px;
}

.admin-dashboard-header .modal-close {
  position: static;
}

.admin-dashboard-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.admin-logout-btn {
  border: 1px solid #e6cfd0;
  color: var(--wine);
  background: white;
  padding: 13px 18px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
}

.admin-table-wrap {
  width: 100%;
  overflow-x: auto;
  background: white;
  border: 1px solid var(--line);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  font-size: 11px;
}

.admin-table th,
.admin-table td {
  padding: 13px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.admin-table th {
  background: #f4ece8;
  color: var(--wine);
}

.admin-table td {
  color: #655960;
}

.table-edit-btn,
.table-delete-btn {
  border: 0;
  padding: 7px 10px;
  margin: 2px;
  cursor: pointer;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 700;
}

.table-edit-btn {
  background: #f0e4e3;
  color: var(--wine);
}

.table-delete-btn {
  background: #fbe9e9;
  color: #b13e50;
}

.admin-profile-form {
  margin-top: 25px;
  padding: 22px;
  background: white;
  border: 1px solid var(--line);
}

.admin-profile-form h3 {
  font: 600 22px "Playfair Display", serif;
  color: var(--wine);
  margin: 0 0 20px;
}

.admin-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.admin-form-grid .wide-field {
  grid-column: 1 / -1;
}

.admin-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.admin-profile-form textarea {
  resize: vertical;
  font-family: inherit;
}

@media(max-width:640px) {
  .header-actions {
    gap: 6px;
  }

  .header-cta {
    display: none;
  }

  .admin-open-btn {
    padding: 10px 12px;
    font-size: 11px;
  }

  .admin-box {
    padding: 24px 18px;
  }

  .admin-dashboard-box {
    padding: 20px 14px;
  }

  .admin-form-grid {
    grid-template-columns: 1fr;
  }

  .admin-form-grid .wide-field {
    grid-column: auto;
  }

  .admin-dashboard-actions {
    align-items: stretch;
  }

  .admin-dashboard-actions button {
    flex: 1;
  }
    }
