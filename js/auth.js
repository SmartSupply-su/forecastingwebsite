// ✅ Supabase Init
const supabaseUrl = 'https://pbekzjgteinnntprfzhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // your full key
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// ✅ Define Pages
const protectedPages = ["home.html", "upload.html", "forecast.html", "sales.html", "inventory.html"];
const currentPage = window.location.pathname.split("/").pop();

// ✅ Page Entry
document.addEventListener("DOMContentLoaded", async () => {
  // --- Check Auth State On Load ---
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  console.log("🟡 Session on page load:", session);

  // 🔐 Protected Page Handling
  if (protectedPages.includes(currentPage)) {
    if (!session) {
      console.log("🔒 No session on protected page, redirecting...");
      return window.location.href = "index.html";
    }
    document.body.style.display = "block";
  }

  // 🧭 On Login Page
  if (currentPage === "index.html") {
    if (session) {
      console.log("🔁 Already logged in, redirecting to home.html");
      return window.location.href = "home.html";
    }

    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          alert("❌ Login failed: " + error.message);
          return;
        }

        // 🕒 Wait for session to sync
        console.log("⏳ Logging in...");
        const MAX_WAIT = 2000; // 2 seconds
        const INTERVAL = 200;
        let waited = 0;

        const waitUntilSession = setInterval(async () => {
          const { data: { session: newSession } } = await supabase.auth.getSession();

          if (newSession) {
            clearInterval(waitUntilSession);
            console.log("✅ Session ready. Redirecting...");
            return window.location.href = "home.html";
          }

          waited += INTERVAL;
          if (waited >= MAX_WAIT) {
            clearInterval(waitUntilSession);
            alert("⚠️ Login might have succeeded, but session is not ready. Please refresh.");
          }
        }, INTERVAL);
      });
    }
  }
});

// 🔓 Logout Handler
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// 🍔 Header Toggle
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("show");
}

window.logout = logout;
window.toggleMenu = toggleMenu;
