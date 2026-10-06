import { useState } from "react";
import { LoaderCircle, Mail } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import api from "../services/api";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";

  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/verify-email", {
        email,
        code,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/signin", {
          replace: true,
          state: {
            message: "Email verified successfully. You can now sign in.",
          },
        });
      }, 1200);
    } catch (error: any) {
      console.error("Email verification error:", error);

      setError(
        error.response?.data?.message ||
          "We could not verify your email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setResending(true);

    try {
      const response = await api.post(
        "/auth/resend-verification",
        {
          email,
        }
      );

      setSuccess(response.data.message);
    } catch (error: any) {
      console.error("Resend verification error:", error);

      setError(
        error.response?.data?.message ||
          "We could not send a new verification code."
      );
    } finally {
      setResending(false);
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
          <div className="auth-verification-icon">
            <Mail size={28} />
          </div>

          <h1>Verify your email</h1>

            <p>
            We sent a 6-digit verification code to your email address.
            If you don't see it in your inbox, please check your spam or
            junk folder.
            </p>
        </div>

        <form className="auth-form" onSubmit={handleVerify}>
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success" role="status">
              {success}
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="verification-email">
              Email address
            </label>

            <input
              id="verification-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="verification-code">
              Verification code
            </label>

            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) =>
                setCode(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
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
                Verifying...
              </>
            ) : (
              "Verify email"
            )}
          </button>
        </form>

        <div className="auth-resend">
          <span>Didn't receive the code?</span>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>

        <p className="auth-switch">
          Already verified?{" "}
          <Link to="/signin">Sign in</Link>
        </p>
      </main>
    </div>
  );
}

export default VerifyEmail;