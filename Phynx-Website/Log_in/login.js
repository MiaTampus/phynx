const DEPARTMENT_ROUTES = {
    "admin": "../Admin/admin_dashboard.html",
    "finance": "../Finance/finance_dashboard.html",
    "marketing": "../Maketing/marketing_dashboard.html",
    "procurement": "../Procurement/procurement_dashboard.html",
    "inventory": "../Inventory/pynx-inventory/index.html",
    "logistics": "../Logistics/logistics_dashboard.html"
};

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");
const loginButton = document.getElementById("loginButton");

function showError(message) {
    errorMessage.textContent = message;
}

function setLoading(isLoading) {
    loginButton.disabled = isLoading;
    loginButton.style.opacity = isLoading ? "0.7" : "1";
    loginButton.style.cursor = isLoading ? "not-allowed" : "pointer";
}

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    showError("");
    setLoading(true);

    let identifier = usernameInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!identifier.includes("@")) {
        identifier = identifier + "@phynx.web";
    }

    try {
        // 1. Sign in with Supabase Auth
        const { data: authData, error: authError } =
            await window.supabaseClient.auth.signInWithPassword({
                email: identifier,
                password: password
            });

        if (authError || !authData || !authData.user) {
            showError("Invalid username or password.");
            setLoading(false);
            return;
        }

        // 2. Get the user's department from the profiles table
        const { data: profile, error: profileError } =
            await window.supabaseClient
                .from("profiles")
                .select("username, department, role")
                .eq("id", authData.user.id)
                .single();

        if (profileError || !profile) {
            await window.supabaseClient.auth.signOut();
            showError("No department profile found for this account.");
            setLoading(false);
            return;
        }

        // 3. Redirect to the correct department page
        const destination = DEPARTMENT_ROUTES[profile.department.toLowerCase()];

        if (!destination) {
            await window.supabaseClient.auth.signOut();
            showError("No workspace is assigned to this department.");
            setLoading(false);
            return;
        }

        window.location.href = destination;

    } catch (err) {
        console.error(err);
        showError("Something went wrong. Please try again.");
        setLoading(false);
    }
});