import { useState } from "react";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
const user = await signIn({
  email,
  password,
});

if (user.role === "admin") {
  navigate("/admin", { replace: true });
} else if (user.role === "restaurant") {
  navigate("/restaurant-dashboard", { replace: true });
} else if (user.role === "rider") {
  navigate("/rider-dashboard", { replace: true });
} else {
  navigate("/home", { replace: true });
}
    } catch (error: any) {
      console.error("Signin error:", error);

      setError(
        error.response?.data?.message ||
          "We could not sign you in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-content">
        <div className="auth-brand">
  <img
  src="/logo/chopgo-logo-vertical.png"
  alt="ChopGo"
/>
</div>

        <div className="auth-header">
          <h1>Welcome back</h1>
          <p>
            Sign in to order your favorite food and track your
            deliveries.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

              <div className="auth-field">
                <label htmlFor="email">Email address</label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="auth-field">
      <label htmlFor="password">Password</label>

      <div className="auth-password-wrapper">
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <button
          type="button"
          className="auth-password-toggle"
          onClick={() =>
            setShowPassword((current) => !current)
          }
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
        >
          {showPassword ? (
            <EyeOff size={20} />
          ) : (
            <Eye size={20} />
          )}
        </button>
      </div>
    </div>

    <div className="auth-forgot-password">
      <Link to="/forgot-password">
        Forgot password?
      </Link>
    </div>

    <button
      type="submit"
      className="auth-submit-button"
      disabled={loading}
    >
            {loading ? (
              <>
                <LoaderCircle
                  className="auth-spinner"
                  size={20}
                />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">Create one</Link>
        </p>
      </main>
    </div>
  );
}

export default SignIn;