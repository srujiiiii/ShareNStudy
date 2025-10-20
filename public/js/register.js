(function () {
  function safeLog() { if (typeof console !== "undefined") console.log.apply(console, arguments); }
  function showDebugLine(text) {
    const debug = document.getElementById("debug");
    if (!debug) return;
    debug.style.display = "block";
    debug.innerText = debug.innerText + "\\n" + (typeof text === "object" ? JSON.stringify(text) : String(text));
    debug.scrollTop = debug.scrollHeight;
  }
  function init() {
    const form = document.getElementById("regForm");
    const msg = document.getElementById("msg");
    if (!form) { safeLog("Registration form not found."); return; }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.innerText = "";
      const payload = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        phone: document.getElementById("phone").value.trim()
      };
      if (!payload.name || !payload.email || !payload.password) { msg.innerText = "Please fill required fields."; return; }
      msg.innerText = "Registering...";
      try {
        const res = await apiPost("/api/auth/register", payload);
        safeLog("[register] server response", res);
        if (res && res.token) {
          try {
            localStorage.setItem("token", res.token);
            const actualRole = res.user && res.user.role ? res.user.role : "student";
            localStorage.setItem("role", actualRole);
            try { localStorage.setItem("ui_role", actualRole); } catch (err) {}
          } catch (err) { console.warn("localStorage set failed", err); }
          const redirectTo = res.redirectTo || ((res.user && res.user.role === "admin") ? "/admin/admin-dashboard" : "/dashboard");
          msg.innerText = "Registration successful — redirecting...";
          setTimeout(() => { window.location.href = redirectTo; }, 80);
          return;
        }
        safeLog("Register failed response", res);
        msg.innerText = res?.message || "Registration failed";
        showDebugLine({ "register-response": res });
      } catch (err) {
        console.error("Register error", err);
        msg.innerText = "Registration error";
        showDebugLine({ "register-error": String(err) });
      }
    });
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", init); } else { init(); }
})();