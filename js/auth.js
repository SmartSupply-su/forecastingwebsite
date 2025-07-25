// 🌐 Supabase Initialization
const supabaseUrl = 'https://pbekzjgteinnntprfzhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZWt6amd0ZWlubm50cHJmemhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDM5MjYsImV4cCI6MjA2NDkxOTkyNn0.1yRQEisizC-MpDR6B5fJc2Z7Wzk1xcwsySyJMktSsF4';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// 🛡️ Protected Pages
const protectedPages = ["home.html", "upload.html", "forecast.html", "sales.html", "inventory.html"];
const currentPage = window.location.pathname.split("/").pop();

document.addEventListener("DOMContentLoaded", async () => {
  // 🔐 Manual session restore (before any checks)
  const access_token = localStorage.getItem("sb-access-token");
  const refresh_token = localStorage.getItem("sb-refresh-token");

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    console.log("🔁 Session restored:", data.session);
  }

  // 🔒 Page protection
  if (protectedPages.includes(currentPage)) {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.warn("🔐 Protected page — no session");
      window.location.href = "index.html";
    } else {
      console.log("✅ Authenticated — showing protected page");
      document.body.style.display = "block";
    }
  }

  // 🧭 On login page — auto redirect if already logged in
  if (currentPage === "index.html") {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      console.log("✅ Already logged in — redirecting to home");
      window.location.href = "home.html";
      return;
    }

    // 🧾 Attach login handler
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          alert("Login failed: " + error.message);
          console.error("❌ Login error:", error);
          return;
        }

        // 💾 Save session tokens manually
        localStorage.setItem("sb-access-token", data.session.access_token);
        localStorage.setItem("sb-refresh-token", data.session.refresh_token);

        console.log("✅ Login successful — redirecting to home.html");
        window.location.href = "home.html";
      });
    }
  }
});

// 🚪 Logout: Sign out + clear tokens
async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("sb-access-token");
  localStorage.removeItem("sb-refresh-token");
  window.location.href = "index.html";
}

// 🍔 Responsive Nav
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("show");
}

// 🌍 Global Access
window.logout = logout;
window.toggleMenu = toggleMenu;
