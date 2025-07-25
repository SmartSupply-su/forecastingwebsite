// 🌐 Supabase Initialization
const supabaseUrl = 'https://pbekzjgteinnntprfzhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZWt6amd0ZWlubm50cHJmemhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDM5MjYsImV4cCI6MjA2NDkxOTkyNn0.1yRQEisizC-MpDR6B5fJc2Z7Wzk1xcwsySyJMktSsF4';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// 🛡️ Define Protected Pages
const protectedPages = ["home.html", "upload.html", "forecast.html", "sales.html", "inventory.html"];
const currentPage = window.location.pathname.split("/").pop();

document.addEventListener("DOMContentLoaded", async () => {
  // 🔒 Protect Restricted Pages
  if (protectedPages.includes(currentPage)) {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("🔒 Protected page session:", session);

    if (!session) {
      window.location.href = "index.html";
      return;
    } else {
      document.body.style.display = "block";
    }
  }

  // 🔁 Redirect logged-in users away from login page
  if (currentPage === "index.html") {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("🧭 On login page, session:", session);

    if (session) {
      window.location.href = "home.html";
      return;
    }

    // ✅ Handle Login Form
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

        console.log("✅ Login success, waiting for session...");

        // ⏳ Wait for session to fully initialize before redirecting
        supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN") {
            console.log("✅ Session active, redirecting...");
            setTimeout(() => {
              window.location.href = "home.html";
            }, 300); // short delay ensures session is persisted
          }
        });
      });
    }
  }
});

// 🔓 Logout
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// 🍔 Responsive Menu
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("show");
}

// 🌍 Expose for global use
window.logout = logout;
window.toggleMenu = toggleMenu;
