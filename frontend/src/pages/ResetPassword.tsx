import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  LoaderCircle,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import api from "../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError(
        "This password reset link is invalid or incomplete."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        password,
      });

      setSuccess(true);
    } catch (error: any) {
      console.error("Reset password error:", error);

      setError(
        error.response?.data?.message ||
          "We could not reset your password. Please try again."
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
            <CheckCircle size={30} />
          </div>

          <div className="auth-header">
            <h1>Password updated</h1>

            <p>
              Your ChopGo password has been successfully
              changed. You can now sign in with your new
              password.
            </p>
          </div>

          <button
            type="button"
            className="auth-submit-button"
            onClick={() => navigate("/signin")}
          >
            Sign in
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <main className="auth-content">
        <Link
          to="/signin"
          className="auth-back-link"
        >
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
          <h1>Reset password</h1>

          <p>
            Create a new password for your ChopGo
            account.
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {error && (
            <div
              className="auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="new-password">
              New password
            </label>

            <div className="auth-password-wrapper">
              <input
                id="new-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your new password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
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

          <div className="auth-field">
            <label htmlFor="confirm-password">
              Confirm new password
            </label>

            <div className="auth-password-wrapper">
              <input
                id="confirm-password"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm your new password"
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                className="auth-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
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
                Updating password...
              </>
            ) : (
              "Update password"
            )}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password?{" "}
          <Link to="/signin">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}

export default ResetPassword;