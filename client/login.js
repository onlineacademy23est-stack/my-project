document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-btn");
    const codeInput = document.getElementById("lab-code");
    const nameInput = document.getElementById("fb-name");

    loginButton.addEventListener("click", async () => {
        const labCode = codeInput.value;
        const fbName = nameInput.value;

        if (!labCode || !fbName) {
            alert("Enter LAB ID and FB Name!");
            return;
        }

        // I-disable ang button habang naglo-load
        loginButton.disabled = true;
        loginButton.innerText = "Logging in...";

        try {
            const response = await fetch("https://online-learning-backend-3710.onrender.com/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ labCode, fbName })
            });

            const data = await response.json();

            if (data.success) {
                // SUCCESS: I-save sa localStorage
                localStorage.setItem("lab_code", labCode);
                localStorage.setItem("fb_name", fbName);
                
                alert("Login successful! ✅");
                window.location.href = "dashboard.html"; // Dito ka i-re-redirect
            } else {
                // FAIL: Ipakita ang error galing sa server
                alert(data.msg || "Login failed.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            alert("Hindi maka-connect sa server. Check your internet.");
        } finally {
            loginButton.disabled = false;
            loginButton.innerText = "Login";
        }
    });
});