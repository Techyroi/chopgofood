import { useState } from "react";
import { ArrowLeft, LoaderCircle, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email,
      });

      setSuccess(true);
    } catch (error: any) {
      console.error("Forgot password error:", error);

      setError(
        error.response?.data?.message ||
          "We could not process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <main className="auth-content">
          <div className="auth-brand">
            <div className="auth-brand-mark">C</div>
            <span>ChopGo</span>
          </div>

          <div className="auth-success-icon">
            <Mail size={30} />
          </div>

          <div className="auth-header">
            <h1>Check your email</h1>
            <p>
              If an account exists with that email, we've sent
              instructions to reset your password.
            </p>
          </div>

          <button
            type="button"
            className="auth-submit-button"
            onClick={() => navigate("/signin")}
          >
            Back to sign in
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <main className="auth-content">
        <Link to="/signin" className="auth-back-link">
          <ArrowLeft size={20} />
          <span>Back to sign in</span>
        </Link>

        <div className="auth-brand">
  <img
  src="/logo/chopgo-logo-vertical.png"
  alt="ChopGo"
/>
</div>

        <div className="auth-header">
          <h1>Forgot password?</h1>
          <p>
            Enter the email address associated with your
            ChopGo account and we'll help you reset your
            password.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="forgot-email">
              Email address
            </label>

            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
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
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/signin">Sign in</Link>
        </p>
      </main>
    </div>
  );
}

export default ForgotPassword;