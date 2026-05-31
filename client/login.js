import { useState } from "react";

export default function Login() {
  const [code, setCode] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  function handleLogin() {
    if (!code) {
      alert("Enter LAB ID!");
      return;
    }

    if (!code.startsWith("LAB")) {
      alert("Invalid LAB ID!");
      return;
    }

    // SAVE LOGIN
    localStorage.setItem("lab_code", code);

    // SHOW RESULT SCREEN
    setLoggedIn(true);
  }

  if (loggedIn) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Login Successful ✅</h1>
        <h2>Your LAB ID:</h2>
        <h3>{code}</h3>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Enter LAB ID</h2>

      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="e.g. LAB123"
      />

      <br /><br />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}