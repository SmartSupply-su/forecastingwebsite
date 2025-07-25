// ✅ Responsive Header Toggle
function toggleMenu() {
  const nav = document.getElementById("navLinks");
  nav.classList.toggle("show");
}

// ✅ Global Supabase Setup
const supabaseUrl = 'https://pbekzjgteinnntprfzhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZWt6amd0ZWlubm50cHJmemhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDM5MjYsImV4cCI6MjA2NDkxOTkyNn0.1yRQEisizC-MpDR6B5fJc2Z7Wzk1xcwsySyJMktSsF4';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// ✅ DOM Ready
document.addEventListener("DOMContentLoaded", async () => {
  const protectedPages = ["home.html", "upload.html", "forecast.html", "sales.html", "inventory.html"];
  const currentPage = window.location.pathname.split("/").pop();

  // 🔹 Dropdown Handling
  const dropdowns = document.querySelectorAll('.dropdown');
  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      document.querySelectorAll('.dropdown.open').forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    });
    dropdown.addEventListener('mouseleave', function () {
      dropdown.classList.remove('open');
    });
    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
    });
  });

  // 🔒 Protect pages
  if (protectedPages.includes(currentPage)) {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Protected page session:", session);

    if (!session) {
      window.location.href = "index.html";
      return;
    } else {
      document.body.style.display = "block";
    }
  }

  // 🧭 Redirect logged-in users away from login page
  if (currentPage === "index.html") {
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Login page session:", session);
    if (session) {
      window.location.href = "home.html";
      return;
    }

    // Attach login form handler
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          alert("Login failed: " + error.message);
          console.error("Login error:", error);
          return;
        }

        console.log("Login success, redirecting to home.html");
        window.location.href = "home.html";
      });
    }
  }
});

// 🔓 Logout
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

// 🌐 Expose globally if used inline
window.toggleMenu = toggleMenu;
window.logout = logout;
