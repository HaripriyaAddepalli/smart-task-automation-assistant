import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { api } from "../services/api";
import { setStoredUser } from "../auth/authUtils";
import "./Login.css";


function formatStoredUser(user: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null; providerData?: Array<{ providerId?: string }> }) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    providerId: user.providerData?.[0]?.providerId,
  };
}

const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string): { valid: boolean; strength: "weak" | "fair" | "good" | "strong" } => {
  if (password.length < 6) return { valid: false, strength: "weak" };
  if (password.length < 8) return { valid: true, strength: "fair" };
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return { valid: true, strength: "good" };
  return { valid: true, strength: "strong" };
};

export default function Login() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const passwordValidation = validatePassword(password);
  const emailValid = !email || validateEmail(email);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError("");
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) return;
    setGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      setStoredUser(formatStoredUser(user));

      // Notify backend
      await api.post("/auth/google", {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      });

      toast.success("✨ Google Login Successful!");
      navigate("/onboarding", { replace: true });
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const code = err.code;

      if (code === "auth/unauthorized-domain") {
        toast.error("This domain is not authorized. Check Firebase Console.");
      } else if (code === "auth/popup-blocked") {
        toast.error("Popup was blocked. Please allow popups and try again.");
      } else if (code === "auth/popup-closed-by-user") {
        toast.error("Login cancelled.");
      } else {
        toast.error(err.message || "Google login failed. Please try again.");
      }
      console.error("Google login error:", err);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailPasswordAuth = async () => {
    // Validation
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (mode === "signup" && !passwordValidation.valid) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setStoredUser(formatStoredUser(result.user));
        toast.success("🎉 Welcome back!");
        navigate("/dashboard", { replace: true });
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setStoredUser(formatStoredUser(result.user));
        toast.success("✨ Account created successfully!");
        navigate("/onboarding", { replace: true });
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      }
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const code = err.code;

      if (code === "auth/email-already-in-use") {
        toast.error("This email is already registered. Please login instead.");
      } else if (code === "auth/weak-password") {
        toast.error("Password is too weak. Use at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setEmailError("Invalid email address");
        toast.error("Please enter a valid email");
      } else if (code === "auth/user-not-found") {
        toast.error("No account found with this email. Try signing up.");
      } else if (code === "auth/wrong-password") {
        toast.error("Incorrect password. Please try again.");
      } else {
        toast.error(err.message || "Authentication failed. Please try again.");
      }
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading && email && password) {
      handleEmailPasswordAuth();
    }
  };

  const useDemoAccount = () => {
    setEmail("demo@example.com");
    setPassword("Demo123!");
toast.success("Demo account loaded. Click login to continue.");
  };

  const isFormValid = email && password && emailValid && (mode === "login" || passwordValidation.valid);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="gradient-orb gradient-orb-1"></div>
        <div className="gradient-orb gradient-orb-2"></div>
      </div>

      <div className="login-content">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="brand-header">
            <div className="brand-icon">✨</div>
            <h1>AI Task Assistant</h1>
          </div>
          <p className="brand-tagline">
            Transform your workflow with intelligent task prioritization and AI-powered automation.
          </p>
          <div className="features-list">
            <div className="feature">
              <span>🎯</span> AI-Powered Prioritization
            </div>
            <div className="feature">
              <span>🎤</span> Voice Commands
            </div>
            <div className="feature">
              <span>👥</span> Team Collaboration
            </div>
            <div className="feature">
              <span>🚀</span> Smart Automation
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form">
            {/* Header */}
            <div className="form-header">
              <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p>
                {mode === "login"
                  ? "Sign in to your account to continue"
                  : "Join thousands using AI Task Assistant"}
              </p>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="google-button"
            >
              {googleLoading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Signing in...
                </>
              ) : (
                <>
                <span style={{ fontSize: "18px" }}>🔵</span>
                Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="divider">
              <span>or</span>
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`form-input ${emailError ? "error" : ""}`}
                  disabled={loading}
                />
              </div>
              {emailError && <span className="error-text">{emailError}</span>}
              {email && !emailError && emailValid && (
                <span className="success-text">✓ Email looks good</span>
              )}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "login" ? "Enter your password" : "Create a strong password"}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={`form-input ${passwordError ? "error" : ""}`}
                  disabled={loading}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  type="button"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <span className="error-text">{passwordError}</span>}

              {/* Password Strength (Signup only) */}
              {mode === "signup" && password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className={`strength-fill strength-${passwordValidation.strength}`}
                    ></div>
                  </div>
                  <span className={`strength-text strength-${passwordValidation.strength}`}>
                    {passwordValidation.strength === "weak" && "Weak"}
                    {passwordValidation.strength === "fair" && "Fair"}
                    {passwordValidation.strength === "good" && "Good"}
                    {passwordValidation.strength === "strong" && "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Remember Me / Forgot Password */}
            {mode === "login" && (
              <div className="form-options">
                <label className="remember-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>
                <button className="forgot-password-link">Forgot password?</button>
              </div>
            )}

            {/* Main Action Button */}
            <button
              onClick={handleEmailPasswordAuth}
              disabled={!isFormValid || loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Mode Toggle */}
            <div className="mode-toggle">
              <span>
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}
              </span>
              <button
                onClick={() => {
                  setMode(mode === "login" ? "signup" : "login");
                  setEmailError("");
                  setPasswordError("");
                }}
                className="toggle-link"
                disabled={loading}
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </button>
            </div>

            {/* Demo Account */}
            <button onClick={useDemoAccount} className="demo-button" disabled={loading}>
              🧪 Try Demo Account
            </button>

            {/* Footer */}
            <div className="form-footer">
              <p>
                By continuing, you agree to our{" "}
                <a href="#privacy" className="footer-link">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="#terms" className="footer-link">
                  Terms of Service
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

