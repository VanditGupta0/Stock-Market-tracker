"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === "admin" && password === "1234") {
      document.cookie = "logged_in=true; path=/";
      router.push("/");
    } else {
      setError("Invalid ID or password");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-card">
        <h1 className="login-title">Sign In</h1>

        {error && <p className="login-error">{error}</p>}

        <div className="login-field">
          <label htmlFor="login-id" className="login-label">User ID</label>
          <input
            id="login-id"
            type="text"
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setError(""); }}
            className="login-input"
            placeholder="Enter your ID"
            required
          />
        </div>

        <div className="login-field">
          <label htmlFor="login-password" className="login-label">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            className="login-input"
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="login-submit" id="login-submit-btn">
          Sign in
        </button>
      </form>
    </div>
  );
}
