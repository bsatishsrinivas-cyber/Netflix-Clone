let accordian = document.getElementsByClassName("FAQ__title");

for (let i = 0; i < accordian.length; i++) {
  accordian[i].addEventListener("click", function () {
    if (this.childNodes[1].classList.contains("fa-plus")) {
      this.childNodes[1].classList.remove("fa-plus");
      this.childNodes[1].classList.add("fa-times");
    } else {
      this.childNodes[1].classList.remove("fa-times");
      this.childNodes[1].classList.add("fa-plus");
    }

    let content = this.nextElementSibling;
    if (content.style.maxHeight) {
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

/* ==========================================================================
   Interactive Authentication System (Sign In, Register, Forgot Password)
   ========================================================================== */

(function () {
  const USERS_STORAGE_KEY = "netflix_clone_users";
  const CURRENT_USER_KEY = "netflix_clone_active_user";

  // Pre-seed demo user if no users exist
  function getStoredUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        const initialUsers = {
          "demo@netflix.com": "netflix123",
          "user@netflix.com": "password123",
        };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(stored);
    } catch (e) {
      return { "demo@netflix.com": "netflix123" };
    }
  }

  function saveUser(email, password) {
    const users = getStoredUsers();
    users[email.toLowerCase().trim()] = password;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // DOM Elements
  const navAuthContainer = document.getElementById("navAuthContainer");
  const signInBtn = document.getElementById("signInBtn");
  const modalOverlay = document.getElementById("authModalOverlay");
  const modalCloseBtn = document.getElementById("authModalClose");

  const authMainView = document.getElementById("authMainView");
  const authForgotView = document.getElementById("authForgotView");

  const authTitle = document.getElementById("authTitle");
  const authAlert = document.getElementById("authAlert");
  const authForm = document.getElementById("authForm");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authConfirmGroup = document.getElementById("authConfirmGroup");
  const authConfirmPassword = document.getElementById("authConfirmPassword");
  const showPasswordToggle = document.getElementById("showPasswordToggle");
  const authForgotLink = document.getElementById("authForgotLink");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authSwitchPrompt = document.getElementById("authSwitchPrompt");
  const authSwitchBtn = document.getElementById("authSwitchBtn");

  const authForgotForm = document.getElementById("authForgotForm");
  const forgotEmail = document.getElementById("forgotEmail");
  const forgotNewPassword = document.getElementById("forgotNewPassword");
  const showForgotNewPasswordToggle = document.getElementById("showForgotNewPasswordToggle");
  const authForgotAlert = document.getElementById("authForgotAlert");
  const authForgotBackBtn = document.getElementById("authForgotBackBtn");

  let isRegisterMode = false;

  // Render Alert Message
  function showAlert(container, message, type = "error") {
    container.textContent = message;
    container.className = `auth__alert auth__alert--${type}`;
    container.style.display = "block";
  }

  function clearAlert(container) {
    container.textContent = "";
    container.style.display = "none";
  }

  // Captcha DOM Elements
  const authCaptchaSection = document.getElementById("authCaptchaSection");
  const captchaCanvas = document.getElementById("captchaCanvas");
  const refreshCaptchaBtn = document.getElementById("refreshCaptchaBtn");
  const captchaInput = document.getElementById("captchaInput");
  let currentCaptchaCode = "";

  function generateCaptcha() {
    if (!captchaCanvas) return;
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptchaCode = code;

    const ctx = captchaCanvas.getContext("2d");
    const width = captchaCanvas.width;
    const height = captchaCanvas.height;

    // Background
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, width, height);

    // Security Noise Lines
    const colors = ["#e50914", "#00cec9", "#ffeaa7", "#55efc4", "#a29bfe", "#fd79a8"];
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Security Noise Dots
    for (let i = 0; i < 25; i++) {
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Characters
    const startX = 14;
    const letterSpacing = 22;
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      const x = startX + i * letterSpacing;
      const y = height / 2 + (Math.random() * 4 - 2);
      const angle = (Math.random() - 0.5) * 0.4;

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = "bold 20px 'Poppins', sans-serif";
      ctx.fillStyle = colors[i % colors.length];
      ctx.textBaseline = "middle";
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }

  if (refreshCaptchaBtn) {
    refreshCaptchaBtn.addEventListener("click", function () {
      generateCaptcha();
      if (captchaInput) {
        captchaInput.value = "";
        captchaInput.focus();
      }
    });
  }

  // Open Modal
  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = "flex";
    isRegisterMode = false;
    setAuthMode(false);
    clearAlert(authAlert);
    authForgotLink.style.display = "none";
    if (captchaInput) captchaInput.value = "";
    generateCaptcha();
    showMainView();
    setTimeout(() => authEmail && authEmail.focus(), 100);
  }

  // Close Modal
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = "none";
    clearAlert(authAlert);
    clearAlert(authForgotAlert);
    if (authForm) authForm.reset();
    if (authForgotForm) authForgotForm.reset();
    authForgotLink.style.display = "none";
    if (captchaInput) captchaInput.value = "";
    if (authPassword) authPassword.type = "password";
    if (authConfirmPassword) authConfirmPassword.type = "password";
    if (forgotNewPassword) forgotNewPassword.type = "password";
    if (showPasswordToggle) showPasswordToggle.checked = false;
    if (showForgotNewPasswordToggle) showForgotNewPasswordToggle.checked = false;
  }

  function showMainView() {
    authMainView.style.display = "block";
    authForgotView.style.display = "none";
  }

  function showForgotView() {
    authMainView.style.display = "none";
    authForgotView.style.display = "block";
    clearAlert(authForgotAlert);
    if (authEmail && authEmail.value) {
      forgotEmail.value = authEmail.value;
    }
    setTimeout(() => forgotNewPassword && forgotNewPassword.focus(), 100);
  }

  // Switch between Sign In and Create Account
  function setAuthMode(register) {
    isRegisterMode = register;
    clearAlert(authAlert);
    authForgotLink.style.display = "none";

    if (isRegisterMode) {
      authTitle.textContent = "Create Account";
      authSubmitBtn.textContent = "Create Account";
      authConfirmGroup.style.display = "block";
      authConfirmPassword.required = true;
      if (authCaptchaSection) authCaptchaSection.style.display = "none";
      authSwitchPrompt.textContent = "Already have an account?";
      authSwitchBtn.textContent = "Sign in now";
    } else {
      authTitle.textContent = "Sign In";
      authSubmitBtn.textContent = "Sign In";
      authConfirmGroup.style.display = "none";
      authConfirmPassword.required = false;
      if (authCaptchaSection) authCaptchaSection.style.display = "block";
      if (captchaInput) captchaInput.value = "";
      generateCaptcha();
      authSwitchPrompt.textContent = "New to Netflix?";
      authSwitchBtn.textContent = "Create an account now";
    }
  }

  // Update Navbar for logged in state
  function updateNavAuthState(email) {
    if (!navAuthContainer) return;
    if (email) {
      navAuthContainer.innerHTML = `
        <div class="navbar__user__badge">
          <span class="navbar__user__email" title="${email}">${email}</span>
          <button class="navbar__signout__button" id="signOutBtn">Sign Out</button>
        </div>
      `;
      const signOutBtn = document.getElementById("signOutBtn");
      if (signOutBtn) {
        signOutBtn.addEventListener("click", function () {
          localStorage.removeItem(CURRENT_USER_KEY);
          updateNavAuthState(null);
        });
      }
    } else {
      navAuthContainer.innerHTML = `
        <button class="signin__button" id="signInBtn">Sign in</button>
      `;
      const newSignInBtn = document.getElementById("signInBtn");
      if (newSignInBtn) {
        newSignInBtn.addEventListener("click", openModal);
      }
    }
  }

  // Toggle Password Visibility
  if (showPasswordToggle) {
    showPasswordToggle.addEventListener("change", function () {
      const type = this.checked ? "text" : "password";
      if (authPassword) authPassword.type = type;
      if (authConfirmPassword) authConfirmPassword.type = type;
    });
  }

  if (showForgotNewPasswordToggle) {
    showForgotNewPasswordToggle.addEventListener("change", function () {
      if (forgotNewPassword) {
        forgotNewPassword.type = this.checked ? "text" : "password";
      }
    });
  }

  // Event Listeners for Open / Close
  if (signInBtn) {
    signInBtn.addEventListener("click", openModal);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener("click", function (e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modalOverlay && modalOverlay.style.display === "flex") {
      closeModal();
    }
  });

  // Switch Mode button
  if (authSwitchBtn) {
    authSwitchBtn.addEventListener("click", function () {
      setAuthMode(!isRegisterMode);
    });
  }

  // Forgot password triggers
  if (authForgotLink) {
    authForgotLink.addEventListener("click", showForgotView);
  }

  if (authForgotBackBtn) {
    authForgotBackBtn.addEventListener("click", showMainView);
  }

  // Auth Form Submit Handler (Sign In / Register)
  if (authForm) {
    authForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearAlert(authAlert);

      const email = authEmail.value.trim().toLowerCase();
      const password = authPassword.value;
      const users = getStoredUsers();

      if (isRegisterMode) {
        // Registration Flow
        const confirmPass = authConfirmPassword.value;
        if (password.length < 6) {
          showAlert(authAlert, "Password must be at least 6 characters long.");
          return;
        }
        if (password !== confirmPass) {
          showAlert(authAlert, "Passwords do not match. Please verify.");
          return;
        }
        if (users[email]) {
          showAlert(authAlert, "An account with this email already exists. Please sign in.");
          return;
        }

        saveUser(email, password);
        showAlert(authAlert, "Account created successfully! Switching to Sign In...", "success");
        setTimeout(() => {
          setAuthMode(false);
          authEmail.value = email;
          authPassword.value = password;
          showAlert(authAlert, "Account ready! Solve the captcha and click 'Sign In'.", "success");
        }, 1200);
      } else {
        // Sign In Flow: First verify Captcha
        const enteredCaptcha = (captchaInput ? captchaInput.value : "").trim();
        if (!enteredCaptcha || enteredCaptcha.toLowerCase() !== currentCaptchaCode.toLowerCase()) {
          showAlert(authAlert, "Incorrect captcha verification code. Please try again.");
          generateCaptcha();
          if (captchaInput) {
            captchaInput.value = "";
            captchaInput.focus();
          }
          return;
        }

        if (!users[email]) {
          // Account doesn't exist
          showAlert(
            authAlert,
            "No account found with this email. Click 'Create an account now' below to register."
          );
          authForgotLink.style.display = "none";
          generateCaptcha();
          return;
        }

        // Check if password matches
        if (users[email] !== password) {
          // Password mismatch -> Reveal "Forgot Password?" option
          showAlert(
            authAlert,
            "Incorrect password. If you forgot your password, click 'Forgot password?' below."
          );
          authForgotLink.style.display = "inline-block";
          generateCaptcha();
          return;
        }

        // Successful Sign In
        showAlert(authAlert, "Signed in successfully! Welcome back.", "success");
        localStorage.setItem(CURRENT_USER_KEY, email);
        setTimeout(() => {
          closeModal();
          updateNavAuthState(email);
        }, 800);
      }
    });
  }

  // Forgot Password Submit Handler
  if (authForgotForm) {
    authForgotForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearAlert(authForgotAlert);

      const email = forgotEmail.value.trim().toLowerCase();
      const newPassword = forgotNewPassword.value;
      const users = getStoredUsers();

      if (!users[email]) {
        showAlert(authForgotAlert, "No registered account found with this email address.");
        return;
      }

      if (newPassword.length < 6) {
        showAlert(authForgotAlert, "New password must be at least 6 characters long.");
        return;
      }

      saveUser(email, newPassword);
      showAlert(authForgotAlert, "Password updated successfully! Returning to Sign In...", "success");

      setTimeout(() => {
        showMainView();
        setAuthMode(false);
        authEmail.value = email;
        authPassword.value = newPassword;
        authForgotLink.style.display = "none";
        showAlert(authAlert, "Password updated! You can now sign in with your new password.", "success");
      }, 1500);
    });
  }

  // Check if a user was already signed in from a previous session
  try {
    const activeUser = localStorage.getItem(CURRENT_USER_KEY);
    if (activeUser) {
      updateNavAuthState(activeUser);
    }
  } catch (e) {}
})();

/* ==========================================================================
   Interactive Movie Search Engine
   ========================================================================== */

(function () {
  const MOVIES_DATABASE = [
    {
      id: "stranger-things",
      title: "Stranger Things",
      year: 2022,
      match: "98%",
      rating: "16+",
      duration: "4 Seasons",
      genres: ["Sci-Fi", "Horror", "Drama"],
      poster: "https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/boxshot.png",
      backdrop: "https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/IN-en-20210719-popsignuptwoweeks-perspective_alpha_website_small.jpg",
      overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
      cast: "Millie Bobby Brown, Finn Wolfhard, Winona Ryder, David Harbour"
    },
    {
      id: "squid-game",
      title: "Squid Game",
      year: 2021,
      match: "99%",
      rating: "18+",
      duration: "1 Season",
      genres: ["Thriller", "Drama", "Suspense"],
      poster: "https://images.unsplash.com/photo-1634828221885-9856f67a731f?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
      overview: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
      cast: "Lee Jung-jae, Park Hae-soo, Wi Ha-jun, Jung Ho-yeon"
    },
    {
      id: "wednesday",
      title: "Wednesday",
      year: 2022,
      match: "97%",
      rating: "13+",
      duration: "1 Season",
      genres: ["Comedy", "Fantasy", "Mystery"],
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=1000&q=80",
      overview: "Smart, sarcastic and a little dead inside, Wednesday Addams investigates a murder spree while making new friends — and foes — at Nevermore Academy.",
      cast: "Jenna Ortega, Gwendoline Christie, Riki Lindhome, Christina Ricci"
    },
    {
      id: "money-heist",
      title: "Money Heist",
      year: 2021,
      match: "96%",
      rating: "18+",
      duration: "5 Parts",
      genres: ["Crime", "Thriller", "Action"],
      poster: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80",
      overview: "Eight thieves take hostages and lock themselves in the Royal Mint of Spain as a criminal mastermind manipulates the police to carry out his plan.",
      cast: "Úrsula Corberó, Álvaro Morte, Itziar Ituño, Pedro Alonso"
    },
    {
      id: "dark",
      title: "Dark",
      year: 2020,
      match: "95%",
      rating: "16+",
      duration: "3 Seasons",
      genres: ["Sci-Fi", "Mystery", "Drama"],
      poster: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
      overview: "A missing child sets four families on a frantic hunt for answers as they unearth a mind-bending mystery that spans three generations.",
      cast: "Louis Hofmann, Oliver Masucci, Jördis Triebel, Maja Schöne"
    },
    {
      id: "breaking-bad",
      title: "Breaking Bad",
      year: 2013,
      match: "99%",
      rating: "18+",
      duration: "5 Seasons",
      genres: ["Crime", "Drama", "Thriller"],
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
      overview: "A terminally ill chemistry teacher teams with a former student to manufacture crystal meth to secure his family's financial future.",
      cast: "Bryan Cranston, Aaron Paul, Anna Gunn, Dean Norris"
    },
    {
      id: "the-witcher",
      title: "The Witcher",
      year: 2023,
      match: "94%",
      rating: "18+",
      duration: "3 Seasons",
      genres: ["Fantasy", "Action", "Adventure"],
      poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?auto=format&fit=crop&w=1000&q=80",
      overview: "Geralt of Rivia, a mutated monster-hunter for hire, journeys toward his destiny in a turbulent world where people often prove more wicked than beasts.",
      cast: "Henry Cavill, Anya Chalotra, Freya Allan, Joey Batey"
    },
    {
      id: "inception",
      title: "Inception",
      year: 2010,
      match: "96%",
      rating: "13+",
      duration: "2h 28m",
      genres: ["Sci-Fi", "Action", "Thriller"],
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
      overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      cast: "Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy"
    },
    {
      id: "interstellar",
      title: "Interstellar",
      year: 2014,
      match: "98%",
      rating: "13+",
      duration: "2h 49m",
      genres: ["Sci-Fi", "Adventure", "Drama"],
      poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80",
      overview: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft to find a new planet for humanity.",
      cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine"
    },
    {
      id: "extraction-2",
      title: "Extraction 2",
      year: 2023,
      match: "93%",
      rating: "18+",
      duration: "2h 3m",
      genres: ["Action", "Thriller"],
      poster: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
      overview: "Back from the brink of death, highly skilled commando Tyler Rake takes on another dangerous mission: saving the imprisoned family of a ruthless gangster.",
      cast: "Chris Hemsworth, Golshifteh Farahani, Adam Bessa, Idris Elba"
    },
    {
      id: "red-notice",
      title: "Red Notice",
      year: 2021,
      match: "91%",
      rating: "13+",
      duration: "1h 58m",
      genres: ["Action", "Comedy", "Crime"],
      poster: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80",
      overview: "An FBI profiler pursuing the world's most wanted art thief becomes his reluctant partner in crime to catch an elusive crook who's always one step ahead.",
      cast: "Dwayne Johnson, Ryan Reynolds, Gal Gadot, Ritu Arya"
    },
    {
      id: "the-queens-gambit",
      title: "The Queen's Gambit",
      year: 2020,
      match: "97%",
      rating: "16+",
      duration: "Limited Series",
      genres: ["Drama"],
      poster: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=300&q=80",
      backdrop: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1000&q=80",
      overview: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.",
      cast: "Anya Taylor-Joy, Bill Camp, Marielle Heller, Thomas Brodie-Sangster"
    }
  ];

  const searchInput = document.getElementById("movieSearchInput");
  const searchBtn = document.getElementById("movieSearchBtn");
  const clearBtn = document.getElementById("clearSearchBtn");
  const dropdown = document.getElementById("movieSearchDropdown");
  const resultsList = document.getElementById("movieResultsList");
  const dropdownTitle = document.getElementById("dropdownHeaderTitle");
  const resultCount = document.getElementById("searchResultCount");

  // Movie Detail Modal elements
  const detailOverlay = document.getElementById("movieDetailModalOverlay");
  const detailCloseBtn = document.getElementById("movieDetailCloseBtn");
  const detailTitle = document.getElementById("movieDetailTitle");
  const detailBanner = document.getElementById("movieDetailBanner");
  const detailMatch = document.getElementById("movieDetailMatch");
  const detailYear = document.getElementById("movieDetailYear");
  const detailRating = document.getElementById("movieDetailRating");
  const detailDuration = document.getElementById("movieDetailDuration");
  const detailOverview = document.getElementById("movieDetailOverview");
  const detailGenres = document.getElementById("movieDetailGenres");
  const detailCast = document.getElementById("movieDetailCast");
  const playBtn = document.getElementById("moviePlayBtn");

  function renderMovies(movies, query = "") {
    if (!resultsList) return;
    resultsList.innerHTML = "";

    if (query) {
      dropdownTitle.textContent = `Results for "${query}"`;
      resultCount.textContent = `${movies.length} found`;
    } else {
      dropdownTitle.textContent = "Trending & Popular Titles";
      resultCount.textContent = `${movies.length} titles`;
    }

    if (movies.length === 0) {
      resultsList.innerHTML = `
        <div class="movie__no__results">
          <p>No titles found matching "<strong>${escapeHTML(query)}</strong>".</p>
          <p style="font-size: 12px; margin-top: 6px; color: #888;">Try searching for "Stranger", "Sci-Fi", "Action", or "Drama".</p>
        </div>
      `;
      dropdown.style.display = "block";
      return;
    }

    movies.forEach(movie => {
      const item = document.createElement("div");
      item.className = "movie__result__item";
      item.innerHTML = `
        <img src="${movie.poster}" alt="${escapeHTML(movie.title)}" class="movie__result__poster" onerror="this.src='https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/boxshot.png'" />
        <div class="movie__result__info">
          <div class="movie__result__title">${escapeHTML(movie.title)}</div>
          <div class="movie__result__meta">
            <span class="meta__match">${movie.match}</span>
            <span>${movie.year}</span>
            <span class="meta__badge">${movie.rating}</span>
            <span>${movie.duration}</span>
          </div>
          <div class="movie__result__genre">${movie.genres.join(" • ")}</div>
        </div>
      `;
      item.addEventListener("click", function () {
        openMovieDetail(movie);
      });
      resultsList.appendChild(item);
    });

    dropdown.style.display = "block";
  }

  function escapeHTML(str) {
    return (str || "").replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m];
    });
  }

  function filterMovies(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      renderMovies(MOVIES_DATABASE.slice(0, 6), "");
      return;
    }

    const filtered = MOVIES_DATABASE.filter(movie => {
      const inTitle = movie.title.toLowerCase().includes(q);
      const inGenres = movie.genres.some(g => g.toLowerCase().includes(q));
      const inCast = movie.cast.toLowerCase().includes(q);
      const inYear = movie.year.toString().includes(q);
      return inTitle || inGenres || inCast || inYear;
    });

    renderMovies(filtered, query);
  }

  function openMovieDetail(movie) {
    if (!detailOverlay) return;
    detailTitle.textContent = movie.title;
    detailBanner.style.backgroundImage = `url('${movie.backdrop || movie.poster}')`;
    detailMatch.textContent = movie.match;
    detailYear.textContent = movie.year;
    detailRating.textContent = movie.rating;
    detailDuration.textContent = movie.duration;
    detailOverview.textContent = movie.overview;
    detailGenres.textContent = movie.genres.join(", ");
    detailCast.textContent = movie.cast;

    detailOverlay.style.display = "flex";
  }

  function closeMovieDetail() {
    if (detailOverlay) {
      detailOverlay.style.display = "none";
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const val = this.value;
      if (clearBtn) clearBtn.style.display = val.length > 0 ? "block" : "none";
      filterMovies(val);
    });

    searchInput.addEventListener("focus", function () {
      filterMovies(this.value);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
        clearBtn.style.display = "none";
        filterMovies("");
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      if (searchInput) {
        searchInput.focus();
        filterMovies(searchInput.value);
      }
    });
  }

  // Close dropdown on clicking outside
  document.addEventListener("click", function (e) {
    const searchContainer = document.getElementById("movieSearchSection");
    if (searchContainer && !searchContainer.contains(e.target)) {
      if (dropdown) dropdown.style.display = "none";
    }
  });

  if (detailCloseBtn) {
    detailCloseBtn.addEventListener("click", closeMovieDetail);
  }

  if (detailOverlay) {
    detailOverlay.addEventListener("click", function (e) {
      if (e.target === detailOverlay) closeMovieDetail();
    });
  }

  if (playBtn) {
    playBtn.addEventListener("click", function () {
      alert(`Playing: ${detailTitle ? detailTitle.textContent : "Title"}`);
    });
  }

  // Populate Moving Movie Marquee Tracks
  function initMarquees() {
    const track1 = document.getElementById("marqueeTrack1");
    const track2 = document.getElementById("marqueeTrack2");
    if (!track1 || !track2) return;

    const half = Math.ceil(MOVIES_DATABASE.length / 2);
    const row1Movies = MOVIES_DATABASE.slice(0, half);
    const row2Movies = MOVIES_DATABASE.slice(half);

    // Duplicate for seamless infinite scrolling loop
    const row1Seamless = [...row1Movies, ...row1Movies, ...row1Movies, ...row1Movies];
    const row2Seamless = [...row2Movies, ...row2Movies, ...row2Movies, ...row2Movies];

    function createCard(movie) {
      const card = document.createElement("div");
      card.className = "marquee__movie__card";
      card.innerHTML = `
        <img src="${movie.poster}" alt="${escapeHTML(movie.title)}" class="marquee__movie__poster" onerror="this.src='https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/boxshot.png'" />
        <div class="marquee__movie__overlay">
          <div class="marquee__movie__title">${escapeHTML(movie.title)}</div>
          <div class="marquee__movie__badges">
            <span class="meta__match">${movie.match}</span>
            <span class="meta__badge">${movie.rating}</span>
            <span>${movie.year}</span>
          </div>
        </div>
      `;
      card.addEventListener("click", function () {
        openMovieDetail(movie);
      });
      return card;
    }

    track1.innerHTML = "";
    row1Seamless.forEach(m => track1.appendChild(createCard(m)));

    track2.innerHTML = "";
    row2Seamless.forEach(m => track2.appendChild(createCard(m)));
  }

  initMarquees();

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMovieDetail();
      if (dropdown) dropdown.style.display = "none";
    }
  });
})();


