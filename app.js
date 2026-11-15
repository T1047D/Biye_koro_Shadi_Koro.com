
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
  addDoc,
  setDoc,
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
// SETTINGS
// ==========================================

const SITE_SETTINGS = {
  showBrides: true,
  showGrooms: true,
  administratorWhatsApp: "+8801928860786",
  administratorEmail: "kh4892001@gmail.com"
};

// ==========================================
// ORIGINAL 3 PROFILES
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
// 64 DISTRICTS OF BANGLADESH
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
// HELPERS AND STATE
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

let PROFILES = [...SAMPLE_PROFILES];
let firestoreProfiles = [];
let usingSampleFallback = true;
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

function isAdmin() {
  return currentUser && currentUser.uid === ADMIN_UID;
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

  const phone = SITE_SETTINGS.administratorWhatsApp.replace(/\D/g, "");

  $("contactButton").href = `https://wa.me/${phone}`;
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
    ? visibleProfiles().filter(p => favorites.has(String(p.id)))
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

  // District list inside admin profile form
  if ($("districtOptions")) {
    $("districtOptions").innerHTML = ALL_DISTRICTS.map(v =>
      `<option value="${escapeHTML(v)}"></option>`
    ).join("");
  }
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
    list = list.filter(p => favorites.has(String(p.id)));
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
      <div class="profile-visual ${escapeHTML(p.type)}">
        <button class="fav-btn ${favorites.has(String(p.id)) ? "saved" : ""}"
          data-fav="${escapeHTML(p.id)}"
          aria-label="Save ${escapeHTML(p.name)}">
          ${favorites.has(String(p.id)) ? "♥" : "♡"}
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
// FIRESTORE REALTIME LISTENER
// ==========================================

function startProfileListener() {
  if (unsubscribeProfiles) unsubscribeProfiles();

  unsubscribeProfiles = onSnapshot(
    profilesCollection,
    snapshot => {
      firestoreProfiles = snapshot.docs.map(item => ({
        id: item.id,
        ...item.data()
      }));

      if (firestoreProfiles.length > 0) {
        PROFILES = firestoreProfiles;
        usingSampleFallback = false;
      } else {
        // Show original profiles if Firestore is empty
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

      // Keep sample profiles visible if Firestore read fails
      PROFILES = [...SAMPLE_PROFILES];
      usingSampleFallback = true;

      updateCounts();
      fillFilters();
      render();

      $("dashboardMessage").textContent =
        "Firestore error: " + error.message;
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
    <div class="modal-tag">${escapeHTML(p.type.toUpperCase())} PROFILE</div>
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
  if (isAdmin()) {
    $("adminDashboard").classList.remove("hidden");
    renderAdminProfiles();
  } else {
    $("adminLoginModal").classList.remove("hidden");
  }
}

function closeAdminLogin() {
  $("adminLoginModal").classList.add("hidden");
}

$("adminOpenBtn").addEventListener("click", openAdminLogin);

$("adminLoginClose").addEventListener("click", closeAdminLogin);

$("adminLoginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("adminEmail").value.trim();
  const password = $("adminPassword").value;

  $("loginMessage").textContent = "Signing in...";

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    if (result.user.uid !== ADMIN_UID) {
      await signOut(auth);
      $("loginMessage").textContent =
        "This account does not have administrator permission.";
      return;
    }

    $("adminPassword").value = "";
    $("loginMessage").textContent = "";
    closeAdminLogin();

    $("adminDashboard").classList.remove("hidden");
    renderAdminProfiles();

  } catch (error) {
    console.error(error);
    $("loginMessage").textContent = error.message;
  }
});

onAuthStateChanged(auth, user => {
  currentUser = user;

  $("adminOpenBtn").textContent = isAdmin() ? "Dashboard" : "Admin";

  if (!isAdmin()) {
    $("adminDashboard").classList.add("hidden");
  } else {
    renderAdminProfiles();
  }
});

// ==========================================
// ADMIN DASHBOARD
// ==========================================

function renderAdminProfiles() {
  if (!isAdmin()) {
    $("adminProfileRows").innerHTML =
      '<tr><td colspan="5">Please login as administrator.</td></tr>';
    return;
  }

  if (PROFILES.length === 0) {
    $("adminProfileRows").innerHTML =
      '<tr><td colspan="5">No profiles yet.</td></tr>';
    return;
  }

  $("adminProfileRows").innerHTML = PROFILES.map(p => `
    <tr>
      <td>${escapeHTML(p.name)}</td>
      <td>${escapeHTML(p.type)}</td>
      <td>${escapeHTML(p.district)}</td>
      <td>${escapeHTML(p.age)}</td>
      <td>
        ${usingSampleFallback
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

$("dashboardClose").addEventListener("click", () => {
  $("adminDashboard").classList.add("hidden");
});

$("adminLogoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    $("adminDashboard").classList.add("hidden");
    $("dashboardMessage").textContent = "Logged out successfully.";
  } catch (error) {
    $("dashboardMessage").textContent = error.message;
  }
});

// ==========================================
// PROFILE FORM
// ==========================================

function resetProfileForm() {
  $("profileForm").reset();
  $("editProfileId").value = "";
  $("profileFormTitle").textContent = "Add profile";
  $("formMessage").textContent = "";
}

function showProfileForm(profile = null) {
  if (!isAdmin()) return;

  resetProfileForm();

  if (profile) {
    $("profileFormTitle").textContent = "Edit profile";
    $("editProfileId").value = profile.id;

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
  }

  $("profileForm").classList.remove("hidden");
  $("profileForm").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

$("addProfileBtn").addEventListener("click", () => {
  showProfileForm();
});

$("cancelProfileBtn").addEventListener("click", () => {
  resetProfileForm();
  $("profileForm").classList.add("hidden");
});

$("profileForm").addEventListener("submit", async event => {
  event.preventDefault();

  if (!isAdmin()) {
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

function closeAdminDashboard() {
  if (adminDashboard) {
    adminDashboard.classList.remove("active");
    adminDashboard.classList.add("hidden");
  }
}

function openAdminDashboard() {
  if (!isAdmin) {
    openAdminLogin();
    return;
  }

  if (adminDashboard) {
    adminDashboard.classList.remove("hidden");
    adminDashboard.classList.add("active");
  }

  renderAdminProfiles();
}

// IMPORT ORIGINAL 3 SAMPLE PROFILES
if (importSamplesBtn) {
  importSamplesBtn.addEventListener("click", async () => {
    if (!isAdmin) {
      alert("Please login as admin first.");
      return;
    }

    const confirmed = confirm(
      "Import the original 3 sample profiles into Firebase?"
    );

    if (!confirmed) return;

    try {
      importSamplesBtn.disabled = true;
      importSamplesBtn.textContent = "Importing...";

      for (const profile of SAMPLE_PROFILES) {
        await setDoc(
          doc(db, "profiles", String(profile.id)),
          profile
        );
      }

      alert("Original 3 sample profiles imported successfully!");

      closeAdminDashboard();
      startProfileListener();

    } catch (error) {
      console.error("Sample import error:", error);
      alert("Import failed: " + error.message);

    } finally {
      importSamplesBtn.disabled = false;
      importSamplesBtn.textContent = "Import Original 3 Sample Profiles";
    }
  });
}


// SEARCH AND FILTER EVENTS
if (searchInput) {
  searchInput.addEventListener("input", render);
}

if (districtFilter) {
  districtFilter.addEventListener("change", render);
}

if (educationFilter) {
  educationFilter.addEventListener("change", render);
}

if (typeFilter) {
  typeFilter.addEventListener("change", render);
}


// ADMIN BUTTON
if (adminOpenBtn) {
  adminOpenBtn.addEventListener("click", () => {
    if (isAdmin) {
      openAdminDashboard();
    } else {
      openAdminLogin();
    }
  });
}


// ADMIN LOGIN
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("adminEmail")?.value.trim();
    const password = document.getElementById("adminPassword")?.value;

    if (!email || !password) {
      alert("Enter email and password.");
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (result.user.uid !== ADMIN_UID) {
        await signOut(auth);
        alert("You are not authorized as admin.");
        return;
      }

      isAdmin = true;
      closeAdminLogin();
      openAdminDashboard();

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  });
}


// AUTH STATE
onAuthStateChanged(auth, (user) => {
  isAdmin = Boolean(user && user.uid === ADMIN_UID);

  if (adminOpenBtn) {
    adminOpenBtn.textContent = isAdmin ? "Admin Dashboard" : "Admin";
  }
});


// CLOSE ADMIN LOGIN
if (adminLoginModal) {
  adminLoginModal.addEventListener("click", (event) => {
    if (
      event.target === adminLoginModal ||
      event.target.classList.contains("admin-backdrop")
    ) {
      closeAdminLogin();
    }
  });
}


// CLOSE ADMIN DASHBOARD
if (adminDashboard) {
  adminDashboard.addEventListener("click", (event) => {
    if (
      event.target === adminDashboard ||
      event.target.classList.contains("admin-backdrop")
    ) {
      closeAdminDashboard();
    }
  });
}


// ADMIN LOGOUT
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      isAdmin = false;
      closeAdminDashboard();
      alert("Logged out successfully.");
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  });
}


// ADD PROFILE BUTTON
if (addProfileBtn) {
  addProfileBtn.addEventListener("click", () => {
    if (!isAdmin) {
      alert("Please login first.");
      return;
    }

    openProfileForm();
  });
}


// PROFILE FORM SUBMIT
if (profileForm) {
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!isAdmin) {
      alert("Admin access required.");
      return;
    }

    try {
      const formData = new FormData(profileForm);

      const profile = {
        id: editingProfileId || String(Date.now()),
        type: formData.get("type") || "bride",
        name: formData.get("name") || "",
        age: Number(formData.get("age") || 0),
        height: formData.get("height") || "",
        district: formData.get("district") || "",
        education: formData.get("education") || "",
        profession: formData.get("profession") || "",
        marital: formData.get("marital") || "",
        family: formData.get("family") || "",
        about: formData.get("about") || "",
        preference: formData.get("preference") || "",
        photo: formData.get("photo") || "",
        income: formData.get("income") || ""
      };

      if (!profile.name.trim()) {
        alert("Please enter profile name.");
        return;
      }

      await setDoc(
        doc(db, "profiles", profile.id),
        profile
      );

      alert(
        editingProfileId
          ? "Profile updated successfully!"
          : "New profile added successfully!"
      );

      editingProfileId = null;
      profileForm.reset();
      closeProfileForm();
      startProfileListener();

    } catch (error) {
      console.error("Profile save error:", error);
      alert("Could not save profile: " + error.message);
    }
  });
}


// PROFILE GRID CLICK EVENTS
if (profileGrid) {
  profileGrid.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite]");
    const viewButton = event.target.closest("[data-view]");

    if (favoriteButton) {
      const id = favoriteButton.dataset.favorite;
      toggleFavorite(id);
      return;
    }

    if (viewButton) {
      const id = viewButton.dataset.view;
      const profile = PROFILES.find(
        item => String(item.id) === String(id)
      );

      if (profile) {
        openProfileDetails(profile);
      }
    }
  });
}


// ADMIN PROFILE TABLE EVENTS
if (adminProfileRows) {
  adminProfileRows.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (!isAdmin) return;

    if (editButton) {
      const id = editButton.dataset.edit;

      const profile = PROFILES.find(
        item => String(item.id) === String(id)
      );

      if (profile) {
        editingProfileId = String(profile.id);
        fillProfileForm(profile);
        openProfileForm();
      }
    }

    if (deleteButton) {
      const id = deleteButton.dataset.delete;

      if (!confirm("Are you sure you want to delete this profile?")) {
        return;
      }

      try {
        await deleteDoc(doc(db, "profiles", String(id)));
        alert("Profile deleted successfully!");
        startProfileListener();

      } catch (error) {
        console.error("Delete error:", error);
        alert("Delete failed: " + error.message);
      }
    }
  });
}


// PROFILE DETAILS CLOSE
if (profileModal) {
  profileModal.addEventListener("click", (event) => {
    if (
      event.target === profileModal ||
      event.target.classList.contains("modal-backdrop")
    ) {
      closeProfileDetails();
    }
  });
}


// CONTACT ADMINISTRATION BUTTON
if (contactButton) {
  contactButton.href =
    "https://wa.me/8801928860786?text=" +
    encodeURIComponent("Hello, I want to contact the administration.");
}


// MOBILE MENU
if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });
}


// INITIALIZE WEBSITE
updateCounts();
fillFilters();
render();
startProfileListener();
