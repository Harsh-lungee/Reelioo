import React, { useState } from "react";
import Button from "../components/Button.jsx";
import Card from "../components/Card.jsx";
import Input from "../components/Input.jsx";
import Logo from "../components/Logo.jsx";

const AUTH_API_URL = "https://reelioo.onrender.com/api/auth";

function saveSession({ token, user }) {
  localStorage.setItem("reelioToken", token);
  localStorage.setItem("reelioUser", JSON.stringify(user));
  localStorage.setItem("reelioRole", user.role);
}

export function LoginPage({ navigate, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to log in.");
      }

      saveSession(data);
      onAuthSuccess(data.user);
    } catch (requestError) {
      setError(requestError.message || "Unable to log in.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell>
      <Logo onClick={() => navigate("landing")} />
      <div>
        <h1 className="mt-8 text-3xl font-extrabold">Welcome Back</h1>
        <p className="mt-2 text-reelio-muted">Log in to manage creative projects and requests.</p>
      </div>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          placeholder="you@studio.com"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(event) => updateField("password", event.target.value)}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-reelio-muted">
            <input className="h-4 w-4 rounded border-reelio-lilac" type="checkbox" />
            Remember me
          </label>
          <button className="font-semibold text-reelio-purple" type="button">
            Forgot password?
          </button>
        </div>
        {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
        <Button className="w-full" variant="secondary">
          Continue with Google
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-reelio-muted">
        New to Reelio?{" "}
        <button className="font-bold text-reelio-purple" onClick={() => navigate("signup")} type="button">
          Create an account
        </button>
      </p>
    </AuthShell>
  );
}

export function SignupPage({ navigate, onAuthSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to create account.");
      }

      saveSession(data);
      onAuthSuccess(data.user);
    } catch (requestError) {
      setError(requestError.message || "Unable to create account.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell>
      <Logo onClick={() => navigate("landing")} />
      <div>
        <h1 className="mt-8 text-3xl font-extrabold">Create your account</h1>
        <p className="mt-2 text-reelio-muted">Join as a client or creator and start quickly.</p>
      </div>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Full name"
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@studio.com"
          value={formData.email}
          onChange={(event) => updateField("email", event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(event) => updateField("password", event.target.value)}
        />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-reelio-ink">Role</span>
          <select
            className="w-full rounded-2xl border border-white/80 bg-white/72 px-4 py-3 text-reelio-ink outline-none focus:ring-4 focus:ring-reelio-lilac/25"
            value={formData.role}
            onChange={(event) => updateField("role", event.target.value)}
          >
            <option value="client">Client</option>
            <option value="creator">Creator</option>
          </select>
        </label>
        {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-500">{error}</p>}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
        <Button className="w-full" variant="secondary">
          Continue with Google
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-reelio-muted">
        Already have an account?{" "}
        <button className="font-bold text-reelio-purple" onClick={() => navigate("login")} type="button">
          Log in
        </button>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-lg place-items-center py-10">
      <Card className="w-full p-8 sm:p-10">{children}</Card>
    </section>
  );
}
