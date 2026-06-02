document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-btn");
    const codeInput = document.getElementById("lab-code");
    const nameInput = document.getElementById("fb-name");
 
    // ✅ PUT YOUR ACTUAL RENDER URL HERE (check your Render dashboard)
    const BACKEND_URL = "https://online-learning-backend-3710.onrender.com";
 
    loginButton.addEventListener("click", async (e) => {
        e.preventDefault();
 
        const labCode = codeInput.value.trim().toUpperCase();
        const fbName = nameInput.value.trim();
 
        if (!labCode || !fbName) {
            alert("Enter your LAB Code and Registered FB Name!");
            return;
        }
 
        loginButton.disabled = true;
        loginButton.innerText = "Logging in...";
 
        try {
            const response = await fetch(`${BACKEND_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ labCode, fbName })
            });
 
            const data = await response.json();

console.log("LOGIN RESPONSE:", data);
 
            if (data.success) {
                localStorage.setItem("lab_code", labCode);
                localStorage.setItem("fb_name", fbName);
                alert("Login successful! ✅");
                window.location.href = "dashboard.html";
            } else {
                alert(data.msg || "Login failed. Please check your code.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Hindi maka-connect sa server. Check internet connection.");
        } finally {
            loginButton.disabled = false;
            loginButton.innerText = "Login";
        }
    });
});