// 🌐 Supabase Initialization
const supabaseUrl = 'https://pbekzjgteinnntprfzhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // shortened for readability
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// 🔐 Define Protected Pages
const protectedPages = ["home.html", "upload.html", "forecast.html", "sales.html", "inventory.html"];
const page = window.location.pathname.split("/").pop();

document.addEventListener("DOMContentLoaded", async () => {
  // 🟡 Show login form only if not logged in
  if (page === "index.html") {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("🟡 Current session on load:", session);

    if (session) {
      console.log("✅ Already logged in. Redirecting to home...");
      window.location.href = "home.html";
      return;
    }

    // Handle login form
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

        // Wait until session is fully initialized
        let retries = 0;
        const maxRetries = 10;

        const waitForSession = async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log("✅ Session initialized, redirecting...");
            window.location.href = "home.html";
          } else if (retries < maxRetries) {
            retries++;
            setTimeout(waitForSession, 200);
          } else {
            alert("⚠️ Login succeeded but session not initialized. Try again.");
          }
        };

        waitForSession();
      });
    }
  }

  // 🛡️ Protect private pages
  if (protectedPages.includes(page)) {
    // hide content until verified
    document.body.style.display = "none";

    setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log("🛡️ Checking session on protected page:", session);

      if (!session) {
        window.location.href = "index.html";
      } else {
        document.body.style.display = "block";
      }
    }, 300); // Give Supabase time to restore session
  }
});

// 🔓 Logout
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// 🍔 Responsive Header Menu
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("show");
}

// 🌍 Expose globally
window.logout = logout;
window.toggleMenu = toggleMenu;
