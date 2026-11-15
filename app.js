
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
  setDoc,
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
// SETTINGS
// ==========================================

const SITE_SETTINGS = {
  showBrides: true,
  showGrooms: true,
  administratorWhatsApp: "+8801928860786"
};

// ==========================================
// ORIGINAL 3 SAMPLE PROFILES
// ==========================================

const SAMPLE_PROFILES = [
  {
    id: "sample-1",
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
    id: "sample-2",
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
    id: "sample-3",
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
// 64 DISTRICTS
// ==========================================

const ALL_DISTRICTS = [
  "Bagerhat", "Bandarban", "Barguna", "Barishal",
  "Bhola", "Bogura", "Brahmanbaria", "Chandpur",
  "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla",
  "Dhaka", "Dinajpur", "Faridpur", "Feni",
  "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
  "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah",
  "Joypurhat", "Khagrachhari", "Khulna", "Kishoreganj",
  "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat",
  "Madaripur", "Magura", "Manikganj", "Meherpur",
  "Moulvibazar", "Munshiganj", "Mymensingh", "Naogaon",
  "Narail", "Narayanganj", "Narsingdi", "Natore",
  "Netrokona", "Nilphamari", "Noakhali", "Pabna",
  "Panchagarh", "Patuakhali", "Pirojpur", "Rajbari",
  "Rajshahi", "Rangamati", "Rangpur", "Satkhira",
  "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj",
  "Sylhet", "Tangail", "Thakurgaon"
];

const ALL_EDUCATION = [
  "Primary", "JSC", "SSC", "O Level", "HSC", "A Level",
  "HSC PASS", "Diploma", "Vocational", "Certificate",
  "Degree", "Degree (Pass)", "Honours", "Bachelor's",
  "BA", "BSc", "BBA", "BSS", "LLB", "MBBS", "BDS",
  "Engineering", "Master's", "MA", "MSc", "MBA",
  "MSS", "LLM", "MPhil", "PhD", "Others"
];

// ==========================================
// HTML ELEMENTS AND STATE
// ==========================================

const $ = id => document.getElementById(id);

const profileGrid = $("profileGrid");
const profileModal = $("profileModal");
const modalContent = $("modalContent");
const modalClose = $("modalClose");

const adminLoginModal = $("adminLoginModal");
const adminLoginForm = $("adminLoginForm");
const adminDashboard = $("adminDashboard");
const adminProfileRows = $("adminProfileRows");
const profileForm = $("profileForm");

const adminOpenBtn = $("adminOpenBtn");
const menuToggle = $("menuToggle");
const mainNav = document.querySelector(".main-nav");

let PROFILES = [...SAMPLE_PROFILES];
let currentType = "bride";
let currentUser = null;
let unsubscribeProfiles = null;
let usingSampleFallback = true;
let editingProfileId = null;

let favorites = new Set();

try {
  favorites = new Set(
    JSON.parse(localStorage.getItem("bks_static_favorites") || "[]")
  );
} catch {
  favorites = new Set();
}

function isAdmin() {
  return Boolean(currentUser && currentUser.uid === ADMIN_UID);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
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

  const phone = SITE_SETTINGS.administratorWhatsApp.replace(/\D/g, "");

  $("contactButton").href =
    `https://wa.me/${phone}?text=${encodeURIComponent("Hello, I want to contact the administration.")}`;

  $("contactButton").target = "_blank";
  $("contactButton").rel = "noopener noreferrer";

  document.querySelector('[data-type="bride"]')
    .classList.toggle("hidden", !SITE_SETTINGS.showBrides);

  document.querySelector('[data-type="groom"]')
    .classList.toggle("hidden", !SITE_SETTINGS.showGrooms);
}

// ==========================================
// FILTER DROPDOWNS
// ==========================================

function fillFilters() {
  const oldDistrict = $("districtFilter").value;
  const oldEducation = $("educationFilter").value;

  const districts = [...new Set([
    ...ALL_DISTRICTS,
    ...PROFILES.map(p => p.district).filter(Boolean)
  ])].sort();

  const education = [...new Set([
    ...ALL_EDUCATION,
    ...PROFILES.map(p => p.education).filter(Boolean)
  ])].sort();

  $("districtFilter").innerHTML =
    '<option value="">All districts</option>' +
    districts.map(value =>
      `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`
    ).join("");

  $("educationFilter").innerHTML =
    '<option value="">All education</option>' +
    education.map(value =>
      `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`
    ).join("");

  $("districtFilter").value = oldDistrict;
  $("educationFilter").value = oldEducation;

  $("districtOptions").innerHTML = ALL_DISTRICTS.map(value =>
    `<option value="${escapeHTML(value)}"></option>`
  ).join("");
}

// ==========================================
// PROFILE RENDERING
// ==========================================

function render() {
  const query = $("searchInput").value.trim().toLowerCase();
  const district = $("districtFilter").value;
  const education = $("educationFilter").value;
  const ageRange = $("ageFilter").value;
  const marital = $("maritalFilter").value;

  let list = PROFILES.filter(p =>
    (p.type === "bride" && SITE_SETTINGS.showBrides) ||
    (p.type === "groom" && SITE_SETTINGS.showGrooms)
  );

  if (currentType === "favorites") {
    list = list.filter(p => favorites.has(String(p.id)));
  } else {
    list = list.filter(p => p.type === currentType);
  }

  list = list.filter(p => {
    const searchable = [
      p.name, p.district, p.profession,
      p.education, p.about
    ].join(" ").toLowerCase();

    let ageMatches = true;

    if (ageRange) {
      const [min, max] = ageRange.split("-").map(Number);
      ageMatches =
        Number(p.age) >= min && Number(p.age) <= max;
    }

    return (
      (!query || searchable.includes(query)) &&
      (!district || p.district === district) &&
      (!education || p.education === education) &&
      ageMatches &&
      (!marital || p.marital === marital)
    );
  });

  $("resultCount").textContent =
    `${list.length} ${list.length === 1 ? "profile" : "profiles"}`;

  profileGrid.innerHTML = list.map(p => `
    <article class="profile-card">
      <div class="profile-visual ${escapeHTML(p.type)}">
        <button
          class="fav-btn ${favorites.has(String(p.id)) ? "saved" : ""}"
          data-fav="${escapeHTML(p.id)}"
          aria-label="Save profile">
          ${favorites.has(String(p.id)) ? "♥" : "♡"}
        </button>

        ${
          p.photo
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

  ${isAdmin() ? `
    <button class="table-edit-btn" data-card-edit="${escapeHTML(p.id)}">
      Edit
    </button>

    <button class="table-delete-btn" data-card-delete="${escapeHTML(p.id)}">
      Delete
    </button>
  ` : ""}
</div>

      </div>
    </article>
  `).join("");

  $("emptyState").classList.toggle("hidden", list.length > 0);
  profileGrid.classList.toggle("hidden", list.length === 0);

  $("favoriteCount").textContent = favorites.size;
}

// ==========================================
// FAVORITES
// ==========================================

function toggleFavorite(id) {
  id = String(id);

  if (favorites.has(id)) {
    favorites.delete(id);
  } else {
    favorites.add(id);
  }

  localStorage.setItem(
    "bks_static_favorites",
    JSON.stringify([...favorites])
  );

  updateCounts();
  render();
}

// ==========================================
// FIRESTORE REALTIME LISTENER
// ==========================================

function startProfileListener() {
  if (unsubscribeProfiles) {
    unsubscribeProfiles();
  }

  unsubscribeProfiles = onSnapshot(
    profilesCollection,
    snapshot => {
      const databaseProfiles = snapshot.docs.map(item => ({
        ...item.data(),
        id: item.id
      }));

      if (databaseProfiles.length > 0) {
        PROFILES = databaseProfiles;
        usingSampleFallback = false;
      } else {
        PROFILES = [...SAMPLE_PROFILES];
        usingSampleFallback = true;
      }

      updateCounts();
      fillFilters();
      render();
      renderAdminProfiles();
    },
    error => {
      console.error("Firestore error:", error);

      PROFILES = [...SAMPLE_PROFILES];
      usingSampleFallback = true;

      updateCounts();
      fillFilters();
      render();

      $("dashboardMessage").textContent =
        "Database error: " + error.message;
    }
  );
}

// ==========================================
// FILTER CONTROLS
// ==========================================

function clearFilters() {
  $("searchInput").value = "";
  $("districtFilter").value = "";
  $("educationFilter").value = "";
  $("ageFilter").value = "";
  $("maritalFilter").value = "";

  render();
}

function selectType(type) {
  currentType = type;

  document.querySelectorAll(".type-tab").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.type === type
    );
  });

  clearFilters();
}

// ==========================================
// PROFILE DETAILS MODAL
// ==========================================

function openProfile(id) {
  const p = PROFILES.find(
    profile => String(profile.id) === String(id)
  );

  if (!p) return;

  const phone = SITE_SETTINGS.administratorWhatsApp.replace(/\D/g, "");

  const contactLink =
    `https://wa.me/${phone}?text=${encodeURIComponent(
      `Hello, I am interested in profile ${p.name} (ID: ${p.id}).`
    )}`;

  const photo = p.photo
    ? `<img src="${escapeHTML(p.photo)}" alt="${escapeHTML(p.name)}">`
    : `<div class="avatar">${p.type === "bride" ? "👩🏻" : "👨🏻"}</div>`;

  modalContent.innerHTML = `
    <div class="modal-photo">${photo}</div>

    <div class="modal-tag">
      ${escapeHTML(p.type.toUpperCase())} PROFILE
    </div>

    <h2 id="modalName">${escapeHTML(p.name)}</h2>

    <p class="modal-lead">
      ${escapeHTML(p.age)} years ·
      ${escapeHTML(p.height)} ·
      ${escapeHTML(p.district)}
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
      <p>${escapeHTML(p.about || "Not specified")}</p>
    </div>

    <div class="modal-section">
      <h3>Expected partner</h3>
      <p>${escapeHTML(p.preference || "Not specified")}</p>
    </div>

    <div class="modal-contact">
      <a href="${contactLink}" target="_blank" rel="noopener noreferrer">
        Contact administrator ↗
      </a>
    </div>
  `;

  profileModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  profileModal.classList.add("hidden");
  document.body.style.overflow = "";
}

// ==========================================
// ADMIN LOGIN
// ==========================================

function openAdminLogin() {
  if (isAdmin()) {
    openAdminDashboard();
  } else {
    adminLoginModal.classList.remove("hidden");
  }
}

function closeAdminLogin() {
  adminLoginModal.classList.add("hidden");
}

function openAdminDashboard() {
  if (!isAdmin()) {
    openAdminLogin();
    return;
  }

  adminDashboard.classList.remove("hidden");
  renderAdminProfiles();
}

function closeAdminDashboard() {
  adminDashboard.classList.add("hidden");
  profileForm.classList.add("hidden");
}

adminOpenBtn.addEventListener("click", openAdminLogin);

$("adminLoginClose").addEventListener("click", closeAdminLogin);

$("adminLoginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("adminEmail").value.trim();
  const password = $("adminPassword").value;

  $("loginMessage").textContent = "Signing in...";

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);

      $("loginMessage").textContent =
        "This account does not have administrator permission.";

      return;
    }

    $("adminPassword").value = "";
    $("loginMessage").textContent = "";

    closeAdminLogin();
    openAdminDashboard();

  } catch (error) {
    console.error("Login error:", error);
    $("loginMessage").textContent = error.message;
  }
});

onAuthStateChanged(auth, user => {
  currentUser = user;

  adminOpenBtn.textContent =
    isAdmin() ? "Dashboard" : "Admin";

  if (!isAdmin()) {
    closeAdminDashboard();
  } else {
    renderAdminProfiles();
  }
});

// ==========================================
// ADMIN PROFILE TABLE
// ==========================================

function renderAdminProfiles() {
  if (!isAdmin()) {
    adminProfileRows.innerHTML =
      '<tr><td colspan="5">Please login as administrator.</td></tr>';
    return;
  }

  if (PROFILES.length === 0) {
    adminProfileRows.innerHTML =
      '<tr><td colspan="5">No profiles yet.</td></tr>';
    return;
  }

  adminProfileRows.innerHTML = PROFILES.map(p => `
    <tr>
      <td>${escapeHTML(p.name)}</td>
      <td>${escapeHTML(p.type)}</td>
      <td>${escapeHTML(p.district)}</td>
      <td>${escapeHTML(p.age)}</td>
      <td>
        ${
          usingSampleFallback
            ? '<small>Import samples first</small>'
            : `
              <button class="table-edit-btn" data-edit="${escapeHTML(p.id)}">Edit</button>
              <button class="table-delete-btn" data-delete="${escapeHTML(p.id)}">Delete</button>
            `
        }
      </td>
    </tr>
  `).join("");
}

$("dashboardClose").addEventListener("click", closeAdminDashboard);

adminDashboard.addEventListener("click", event => {
  if (event.target === adminDashboard) {
    closeAdminDashboard();
  }
});

adminLoginModal.addEventListener("click", event => {
  if (event.target === adminLoginModal) {
    closeAdminLogin();
  }
});

$("adminLogoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    closeAdminDashboard();
    $("dashboardMessage").textContent = "Logged out successfully.";
  } catch (error) {
    $("dashboardMessage").textContent = error.message;
  }
});

// ==========================================
// IMPORT ORIGINAL 3 SAMPLE PROFILES
// ==========================================

$("importSamplesBtn").addEventListener("click", async () => {
  if (!isAdmin()) {
    alert("Please login as administrator.");
    return;
  }

  if (!confirm("Import the original 3 sample profiles?")) {
    return;
  }

  const button = $("importSamplesBtn");
  button.disabled = true;
  button.textContent = "Importing...";

  try {
    for (const profile of SAMPLE_PROFILES) {
      await setDoc(
        doc(db, "profiles", String(profile.id)),
        profile
      );
    }

    $("dashboardMessage").textContent =
      "Original 3 sample profiles imported successfully!";

    alert("3 sample profiles imported successfully!");

  } catch (error) {
    console.error("Import error:", error);
    alert("Import failed: " + error.message);

  } finally {
    button.disabled = false;
    button.textContent = "Import sample profiles";
  }
});

// ==========================================
// ADD / EDIT PROFILE FORM
// ==========================================

function openProfileForm(profile = null) {
  if (!isAdmin()) {
    alert("Admin access required.");
    return;
  }

  profileForm.reset();

  if (profile) {
    editingProfileId = String(profile.id);

    $("profileFormTitle").textContent = "Edit profile";
    $("formType").value = profile.type || "bride";
    $("formName").value = profile.name || "";
    $("formAge").value = profile.age || "";
    $("formHeight").value = profile.height || "";
    $("formDistrict").value = profile.district || "";
    $("formEducation").value = profile.education || "";
    $("formProfession").value = profile.profession || "";
    $("formMarital").value = profile.marital || "Never married";
    $("formFamily").value = profile.family || "";
    $("formIncome").value = profile.income || "";
    $("formPhoto").value = profile.photo || "";
    $("formAbout").value = profile.about || "";
    $("formPreference").value = profile.preference || "";

  } else {
    editingProfileId = null;
    $("profileFormTitle").textContent = "Add profile";
    $("formType").value = "bride";
  }
  profileForm.classList.remove("hidden");
  $("formMessage").textContent = "";

  profileForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function closeProfileForm() {
  profileForm.classList.add("hidden");
  profileForm.reset();
  editingProfileId = null;
}

$("addProfileBtn").addEventListener("click", () => {
  openProfileForm();
});

$("cancelProfileBtn").addEventListener("click", closeProfileForm);

profileForm.addEventListener("submit", async event => {
  event.preventDefault();

  if (!isAdmin()) {
    alert("Admin access required.");
    return;
  }
  const saveButton = $("saveProfileBtn");
  saveButton.disabled = true;
  saveButton.textContent = "Saving...";

  const profileId = editingProfileId || String(Date.now());

  const profile = {
    id: profileId,
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

  try {
    if (!profile.name || !profile.district || !profile.education) {
      throw new Error("Please fill in Name, District and Education.");
    }

    await setDoc(
      doc(db, "profiles", profileId),
      profile
    );
       $("formMessage").textContent =
      editingProfileId
        ? "Profile updated successfully!"
        : "Profile added successfully!";

    closeProfileForm();

    $("dashboardMessage").textContent =
      "Profile saved successfully.";

  } catch (error) {
    console.error("Profile save error:", error);
    $("formMessage").textContent = error.message;

  } finally {
    saveButton.disabled = false;
    saveButton.textContent = "Save profile";
  }
});

// ==========================================
// ADMIN EDIT / DELETE EVENTS
// ==========================================

adminProfileRows.addEventListener("click", async event => {
  if (!isAdmin()) return;

  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) {
    const id = editButton.dataset.edit;

    const profile = PROFILES.find(
      p => String(p.id) === String(id)
    );

    if (profile) {
      openProfileForm(profile);
    }
  }

  if (deleteButton) {
    const id = deleteButton.dataset.delete;

    if (!confirm("Are you sure you want to delete this profile?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "profiles", String(id)));

      $("dashboardMessage").textContent =
        "Profile deleted successfully!";

    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed: " + error.message);
    }
  }
});

// ==========================================
// PROFILE GRID EVENTS
// ==========================================

profileGrid.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view]");
  const favoriteButton = event.target.closest("[data-fav]");

  if (favoriteButton) {
    toggleFavorite(favoriteButton.dataset.fav);
    return;
  }

  if (viewButton) {
    openProfile(viewButton.dataset.view);
  }
});

// ==========================================
// PROFILE MODAL CLOSE
// ==========================================

modalClose.addEventListener("click", closeModal);

profileModal.addEventListener("click", event => {
  if (event.target === profileModal) {
    closeModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
    closeAdminLogin();
    closeAdminDashboard();
  }
});

// ==========================================
// SEARCH AND FILTER EVENTS
// ==========================================

$("searchInput").addEventListener("input", render);
$("districtFilter").addEventListener("change", render);
$("educationFilter").addEventListener("change", render);
$("ageFilter").addEventListener("change", render);
$("maritalFilter").addEventListener("change", render);

$("resetFilters").addEventListener("click", clearFilters);
$("emptyReset").addEventListener("click", clearFilters);

document.querySelectorAll(".type-tab").forEach(button => {
  button.addEventListener("click", () => {
    selectType(button.dataset.type);
  });
});

// ==========================================
// MOBILE MENU
// ==========================================

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
    mainNav.classList.toggle("active");

    const isOpen =
      mainNav.classList.contains("open") ||
      mainNav.classList.contains("active");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.textContent = isOpen ? "×" : "☰";
  });
  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open", "active");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    });
  });
}

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

updateCounts();
fillFilters();
render();
startProfileListener();
