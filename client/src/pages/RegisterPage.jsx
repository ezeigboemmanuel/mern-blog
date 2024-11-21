import React, { useState } from "react";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const register = async (e) => {
    e.preventDefault();
    const response = await fetch("https://mern-blog-backend-f3i6.onrender.com/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      alert("Registration successful.");
    } else {
      alert("Registration failed.");
    }

    setUsername("");
    setPassword("");
  };

  return (
    <form onSubmit={(e) => register(e)} className="register">
      <h1>Register</h1>
      <input
        type="text"
        name="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
      />
      <button>Register</button>
    </form>
  );
};

export default RegisterPage;
