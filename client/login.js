document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-btn");
    const codeInput = document.getElementById("lab-code");
    const nameInput = document.getElementById("fb-name");

    loginButton.addEventListener("click", async (e) => {
        e.preventDefault(); 
        const labCode = codeInput.value.trim();
        const fbName = nameInput.value.trim();

        if (!labCode || !fbName) {
            alert("Enter LAB ID and FB Name!");
            return;
        }

        loginButton.disabled = true;
        loginButton.innerText = "Logging in...";

        try {
            // EKSATONG ENDPOINT NA TUTAMA SA server.js MO
            const response = await fetch("https://online-learning-backend-3710.onrender.com/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ labCode, fbName })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("lab_code", labCode);
                localStorage.setItem("fb_name", fbName);
                alert("Login successful! ✅");
                window.location.href = "dashboard.html"; 
            } else {
                alert(data.msg || "Login failed.");
            }
        } catch (err) {
          console.error("Login Error:", err);
            alert("Hindi maka-connect sa server. Check internet.");
        } finally {
            loginButton.disabled = false;
            loginButton.innerText = "Login";
        }
    });
});