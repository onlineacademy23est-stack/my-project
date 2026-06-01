document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-btn");
    const codeInput = document.getElementById("lab-code");
    const nameInput = document.getElementById("fb-name");

    loginButton.addEventListener("click", async (e) => { // Idinagdag ang 'e'
        e.preventDefault(); // <--- ITO ANG IMPORTANTE: Pinipigilan nito ang page refresh

        const labCode = codeInput.value.trim(); // .trim() para tanggalin ang extra spaces
        const fbName = nameInput.value.trim();

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

            // I-check kung valid JSON ang sagot ng server
            if (!response.ok) {
                throw new Error("Server error, status: " + response.status);
            }

            const data = await response.json();

            if (data.success) {
                // SUCCESS
                localStorage.setItem("lab_code", labCode);
                localStorage.setItem("fb_name", fbName);
                
                alert("Login successful! ✅");
                window.location.href = "dashboard.html"; 
            } else {
                // FAIL
                alert(data.msg || "Login failed. Check your credentials.");
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