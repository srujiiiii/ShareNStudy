(function () {
  function safeLog() { if (typeof console !== "undefined") console.log.apply(console, arguments); }

  function roleSelect(r) {
    try {
      const studentBtn = document.getElementById("studentBtn");
      const adminBtn = document.getElementById("adminBtn");
      const roleField = document.getElementById("roleField");
      const registerLink = document.getElementById("registerLink");
      if (!studentBtn || !adminBtn || !roleField) return;
      if (r === "student") {
        studentBtn.classList.add("active");
        adminBtn.classList.remove("active");
        studentBtn.setAttribute("aria-selected", "true");
        adminBtn.setAttribute("aria-selected", "false");
        if (registerLink) registerLink.style.display = "block";
        roleField.value = "student";
      } else {
        adminBtn.classList.add("active");
        studentBtn.classList.remove("active");
        adminBtn.setAttribute("aria-selected", "true");
        studentBtn.setAttribute("aria-selected", "false");
        if (registerLink) registerLink.style.display = "none";
        roleField.value = "admin";
      }
      window._loginRole = r;
      try { localStorage.setItem("ui_role", r); } catch (e) {}
      safeLog("roleSelect set role ->", r);
    } catch (err) { console.error("roleSelect error", err); }
  }

  function showDebugLine(text) {
    const debug = document.getElementById("debug");
    if (!debug) return;
    debug.style.display = "block";
    debug.innerText = debug.innerText + "\\n" + (typeof text === "object" ? JSON.stringify(text) : String(text));
    debug.scrollTop = debug.scrollHeight;
  }

  function init() {
    const studentBtn = document.getElementById("studentBtn");
    const adminBtn = document.getElementById("adminBtn");
    const loginForm = document.getElementById("loginForm");
    const roleField = document.getElementById("roleField");
    const msg = document.getElementById("msg");

    try {
      const saved = localStorage.getItem("ui_role");
      if (saved) roleSelect(saved);
      else roleSelect("student");
    } catch (e) { roleSelect("student"); }

    if (studentBtn) studentBtn.addEventListener("click", () => roleSelect("student"));
    if (adminBtn) adminBtn.addEventListener("click", () => roleSelect("admin"));
    if (studentBtn) studentBtn.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); roleSelect("student"); }});
    if (adminBtn) adminBtn.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); roleSelect("admin"); }});

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.innerText = "";
        const email = (document.getElementById("email") || {}).value || "";
        const password = (document.getElementById("password") || {}).value || "";
        const role = (roleField && roleField.value) ? roleField.value : (window._loginRole || "student");

        if (!email || !password) { msg.innerText = "Please enter email and password"; return; }
        msg.innerText = "Logging in...";

        try {
          const res = await apiPost("/api/auth/login", { email, password, role });
          safeLog("[login] server response", res);
          if (res && res.token) {
            try {
              localStorage.setItem("token", res.token);
              const actualRole = res.user && res.user.role ? res.user.role : role;
              localStorage.setItem("role", actualRole);
              try { localStorage.setItem("ui_role", actualRole); } catch (e) {}
            } catch (err) { console.warn("localStorage set failed", err); }

            const redirectTo = res.redirectTo || ((res.user && res.user.role === "admin") ? "/admin/admin-dashboard" : "/dashboard");
            msg.innerText = "Login successful — redirecting...";
            setTimeout(() => { window.location.href = redirectTo; }, 80);
          } else {
            safeLog("Login failed response", res);
            msg.innerText = res?.message || "Login failed";
            showDebugLine({ "login-response": res });
          }
        } catch (err) {
          console.error("Login error", err);
          msg.innerText = "Login error";
          showDebugLine({ "login-error": String(err) });
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }

  window.roleSelect = roleSelect;
})();