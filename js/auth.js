const supabaseUrl = 'https://pbekzjgteinnntprfzhm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiZWt6amd0ZWlubm50cHJmemhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNDM5MjYsImV4cCI6MjA2NDkxOTkyNn0.1yRQEisizC-MpDR6B5fJc2Z7Wzk1xcwsySyJMktSsF4';
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

const page = window.location.pathname.split("/").pop();
const form = document.querySelector("form");

document.addEventListener("DOMContentLoaded", async () => {
  // 🟢 Restore session
  const access_token = localStorage.getItem("sb-access-token");
  const refresh_token = localStorage.getItem("sb-refresh-token");

  if (access_token && refresh_token) {
    console.log("🌐 Restoring session with tokens");
    await supabase.auth.setSession({ access_token, refresh_token });
  }

  const { data: { session } } = await supabase.auth.getSession();
  console.log("🟡 Current session on load:", session);

  if (page === "home.html") {
    if (!session) {
      alert("No session. Redirecting to login.");
      window.location.href = "index.html";
    } else {
      document.body.style.display = "block";
    }
  }

  if (page === "index.html" && form) {
    if (session) {
      console.log("✅ Already logged in. Redirecting to home.");
      window.location.href = "home.html";
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert("Login failed: " + error.message);
        return;
      }

      console.log("✅ Login success:", data.session);
      localStorage.setItem("sb-access-token", data.session.access_token);
      localStorage.setItem("sb-refresh-token", data.session.refresh_token);

      setTimeout(async () => {
        const { data: { session: newSession } } = await supabase.auth.getSession();
        console.log("🧪 Session after delay:", newSession);
        if (newSession) {
          window.location.href = "home.html";
        } else {
          alert("Session not ready. Please refresh and try again.");
        }
      }, 300); // allow Supabase time to persist session
    });
  }
});

// 🚪 Logout
async function logout() {
  await supabase.auth.signOut();
  localStorage.clear();
  window.location.href = "index.html";
}
window.logout = logout;
