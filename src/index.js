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

  // Open Modal
  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.style.display = "flex";
    isRegisterMode = false;
    setAuthMode(false);
    clearAlert(authAlert);
    authForgotLink.style.display = "none";
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
      authSwitchPrompt.textContent = "Already have an account?";
      authSwitchBtn.textContent = "Sign in now";
    } else {
      authTitle.textContent = "Sign In";
      authSubmitBtn.textContent = "Sign In";
      authConfirmGroup.style.display = "none";
      authConfirmPassword.required = false;
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
          showAlert(authAlert, "Account ready! Click 'Sign In' to proceed.", "success");
        }, 1200);
      } else {
        // Sign In Flow
        if (!users[email]) {
          // Account doesn't exist
          showAlert(
            authAlert,
            "No account found with this email. Click 'Create an account now' below to register."
          );
          authForgotLink.style.display = "none";
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

