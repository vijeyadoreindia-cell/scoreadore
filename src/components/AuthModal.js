import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "./AuthModal.css";

export default function AuthModal({ onClose }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } = useAuth();
  const [mode, setMode] = useState("login"); // login | register | reset
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleGoogle() {
    try {
      setLoading(true);
      await loginWithGoogle();
      toast.success("Signed in with Google!");
      onClose();
    } catch (e) {
      toast.error(e.message || "Google sign-in failed");
    } finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email) { toast.error("Email is required"); return; }
    setLoading(true);
    try {
      if (mode === "reset") {
        await resetPassword(form.email);
        toast.success("Password reset email sent! Check your inbox.");
        setMode("login");
      } else if (mode === "register") {
        if (!form.password || form.password.length < 6) { toast.error("Password must be at least 6 characters"); setLoading(false); return; }
        await registerWithEmail(form.email, form.password, form.name);
        toast.success("Account created! Welcome!");
        onClose();
      } else {
        if (!form.password) { toast.error("Password is required"); setLoading(false); return; }
        await loginWithEmail(form.email, form.password);
        toast.success("Signed in!");
        onClose();
      }
    } catch (e) {
      const msg = e.code === "auth/user-not-found" ? "No account found with this email"
        : e.code === "auth/wrong-password" ? "Incorrect password"
        : e.code === "auth/email-already-in-use" ? "Email already registered"
        : e.code === "auth/invalid-email" ? "Invalid email address"
        : e.code === "auth/too-many-requests" ? "Too many attempts. Try again later."
        : e.message || "Something went wrong";
      toast.error(msg);
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="auth-header">
          <img src="/favicon.png" alt="ADORE India" className="auth-logo" />
          <h2>
            {mode === "login" && "Welcome Back"}
            {mode === "register" && "Create Account"}
            {mode === "reset" && "Reset Password"}
          </h2>
          <p>
            {mode === "login" && "Sign in to your ADORE India account"}
            {mode === "register" && "Join the ADORE India community"}
            {mode === "reset" && "We'll send you a reset link"}
          </p>
        </div>

        {mode !== "reset" && (
          <>
            <button className="google-signin-btn" onClick={handleGoogle} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-divider"><span>or</span></div>
          </>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="form-group">
              <label>Full Name</label>
              <input value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input value={form.email} onChange={set("email")} type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          {mode !== "reset" && (
            <div className="form-group">
              <label>Password</label>
              <div className="password-field">
                <input
                  value={form.password}
                  onChange={set("password")}
                  type={showPass ? "text" : "password"}
                  placeholder={mode === "register" ? "Min. 6 characters" : "Your password"}
                  autoComplete={mode === "register" ? "new-password" : "current-password"}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>
          )}

          {mode === "login" && (
            <button type="button" className="forgot-link" onClick={() => setMode("reset")}>
              Forgot password?
            </button>
          )}

          <button type="submit" className="btn btn-primary btn-full auth-submit" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : null}
            {mode === "login" && "Sign In"}
            {mode === "register" && "Create Account"}
            {mode === "reset" && "Send Reset Email"}
          </button>
        </form>

        <div className="auth-footer">
          {mode === "login" && (
            <p>Don't have an account? <button onClick={() => setMode("register")}>Sign up</button></p>
          )}
          {(mode === "register" || mode === "reset") && (
            <p>Already have an account? <button onClick={() => setMode("login")}>Sign in</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
