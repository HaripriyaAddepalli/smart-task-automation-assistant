import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { completeOnboarding } from "../services/api";
import "./Onboarding.css";

type Step = "welcome" | "profile" | "preferences" | "complete";

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("individual");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminders, setReminders] = useState(true);

  const handleNext = async () => {
    if (step === "welcome") {
      setStep("profile");
    } else if (step === "profile") {
      if (!displayName.trim()) {
        toast.error("Please enter your name");
        return;
      }
      setStep("preferences");
    } else if (step === "preferences") {
      setLoading(true);
      try {
        await completeOnboarding();
        setStep("complete");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        toast.error("Failed to complete onboarding");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Progress Indicator */}
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width:
                step === "welcome"
                  ? "25%"
                  : step === "profile"
                    ? "50%"
                    : step === "preferences"
                      ? "75%"
                      : "100%",
            }}
          />
        </div>

        {/* Welcome Step */}
        {step === "welcome" && (
          <div className="onboarding-step">
            <div className="step-header">
              <h1>Welcome to AI Task Assistant! 👋</h1>
              <p>Let's get you set up in 3 quick steps</p>
            </div>

            <div className="step-content">
              <div className="feature-list">
                <div className="feature-item">
                  <CheckCircle size={24} />
                  <div>
                    <h3>Voice-Powered Tasks</h3>
                    <p>Create tasks by speaking naturally</p>
                  </div>
                </div>
                <div className="feature-item">
                  <CheckCircle size={24} />
                  <div>
                    <h3>AI Prioritization</h3>
                    <p>Get intelligent task rankings</p>
                  </div>
                </div>
                <div className="feature-item">
                  <CheckCircle size={24} />
                  <div>
                    <h3>Team Collaboration</h3>
                    <p>Work together in workspaces</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button onClick={handleSkip} className="skip-button">
                Skip for now
              </button>
              <button onClick={handleNext} className="next-button">
                Let's Go <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Profile Step */}
        {step === "profile" && (
          <div className="onboarding-step">
            <div className="step-header">
              <h1>Tell Us About Yourself</h1>
              <p>Step 1 of 3</p>
            </div>

            <div className="step-content">
              <div className="form-group">
                <label htmlFor="displayName">What's your name?</label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>How do you use this app?</label>
                <div className="radio-group">
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="role"
                      value="individual"
                      checked={role === "individual"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <span>Individual use</span>
                  </label>
                  <label className="radio-option">
                    <input
                      type="radio"
                      name="role"
                      value="team"
                      checked={role === "team"}
                      onChange={(e) => setRole(e.target.value)}
                    />
                    <span>Team/Collaboration</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button
                onClick={() => setStep("welcome")}
                className="back-button"
              >
                Back
              </button>
              <button onClick={handleNext} className="next-button">
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Preferences Step */}
        {step === "preferences" && (
          <div className="onboarding-step">
            <div className="step-header">
              <h1>Your Preferences</h1>
              <p>Step 2 of 3</p>
            </div>

            <div className="step-content">
              <div className="checkbox-group">
                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                  />
                  <span>
                    <strong>Email Notifications</strong>
                    <p>Get daily digest and deadline reminders</p>
                  </span>
                </label>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                  />
                  <span>
                    <strong>Push Notifications</strong>
                    <p>Get instant alerts in your browser</p>
                  </span>
                </label>

                <label className="checkbox-option">
                  <input
                    type="checkbox"
                    checked={reminders}
                    onChange={(e) => setReminders(e.target.checked)}
                  />
                  <span>
                    <strong>Smart Reminders</strong>
                    <p>Get reminders 1 hour before deadlines</p>
                  </span>
                </label>
              </div>
            </div>

            <div className="step-actions">
              <button
                onClick={() => setStep("profile")}
                className="back-button"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="next-button"
              >
                {loading ? "Completing..." : "Get Started"}{" "}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Complete Step */}
        {step === "complete" && (
          <div className="onboarding-step">
            <div className="step-header center">
              <div className="success-icon">✨</div>
              <h1>You're All Set!</h1>
              <p>Welcome aboard, {displayName}!</p>
            </div>

            <div className="step-content">
              <p className="completion-message">
                Your account is ready. You'll be redirected to your dashboard
                in a moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
