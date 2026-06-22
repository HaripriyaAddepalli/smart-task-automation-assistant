import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Bell, CreditCard, Zap } from "lucide-react";
import toast from "react-hot-toast";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  getSubscriptionInfo,
  createCheckout,
  createBillingPortal,
} from "../services/api";
import "./Settings.css";

type NotificationPreferences = {
  emailDigest: boolean;
  deadlineReminders: boolean;
  whatsappEnabled: boolean;
  whatsappNumber?: string;
  telegramEnabled: boolean;
  telegramChatId?: string;
  assignmentAlerts: boolean;
  streakMilestones: boolean;
};

type SubscriptionInfo = {
  plan: string;
  status: string;
  nextBillingDate?: string;
};

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"notifications" | "billing">(
    "notifications"
  );

  const [notificationPrefs, setNotificationPrefs] =
    useState<NotificationPreferences>({
      emailDigest: true,
      deadlineReminders: true,
      whatsappEnabled: false,
      telegramEnabled: false,
      assignmentAlerts: true,
      streakMilestones: true,
    });

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [prefsRes, subRes] = await Promise.all([
        getNotificationPreferences(),
        getSubscriptionInfo(),
      ]);
      setNotificationPrefs(prefsRes.data);
      setSubscription(subRes.data);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateNotificationPreferences(notificationPrefs);
      toast.success("Notification preferences updated!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleCheckout = async (plan: "pro" | "team") => {
    setCheckoutLoading(true);
    try {
      const response = await createCheckout(plan);
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to create checkout session");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setCheckoutLoading(true);
    try {
      const response = await createBillingPortal();
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Error opening billing portal:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <header className="settings-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h1>Settings</h1>
      </header>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab-button ${
              activeTab === "notifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} /> Notifications
          </button>
          <button
            className={`tab-button ${activeTab === "billing" ? "active" : ""}`}
            onClick={() => setActiveTab("billing")}
          >
            <CreditCard size={18} /> Billing
          </button>
        </div>

        {activeTab === "notifications" && (
          <div className="settings-section">
            <h2>Notification Preferences</h2>
            <div className="preferences-form">
              <div className="preference-item">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.emailDigest}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        emailDigest: e.target.checked,
                      })
                    }
                  />
                  <span>Daily Email Digest</span>
                </label>
              </div>

              <div className="preference-item">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.deadlineReminders}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        deadlineReminders: e.target.checked,
                      })
                    }
                  />
                  <span>Deadline Reminders</span>
                </label>
              </div>

              <div className="preference-item">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.assignmentAlerts}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        assignmentAlerts: e.target.checked,
                      })
                    }
                  />
                  <span>Assignment Alerts</span>
                </label>
              </div>

              <div className="preference-item">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.streakMilestones}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        streakMilestones: e.target.checked,
                      })
                    }
                  />
                  <span>Streak Milestones</span>
                </label>
              </div>

              <div className="preference-item">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.whatsappEnabled}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        whatsappEnabled: e.target.checked,
                      })
                    }
                  />
                  <span>WhatsApp Notifications</span>
                </label>
                {notificationPrefs.whatsappEnabled && (
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={notificationPrefs.whatsappNumber || ""}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        whatsappNumber: e.target.value,
                      })
                    }
                    className="sub-input"
                  />
                )}
              </div>

              <div className="preference-item">
                <label>
                  <input
                    type="checkbox"
                    checked={notificationPrefs.telegramEnabled}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        telegramEnabled: e.target.checked,
                      })
                    }
                  />
                  <span>Telegram Notifications</span>
                </label>
                {notificationPrefs.telegramEnabled && (
                  <input
                    type="text"
                    placeholder="Telegram Chat ID"
                    value={notificationPrefs.telegramChatId || ""}
                    onChange={(e) =>
                      setNotificationPrefs({
                        ...notificationPrefs,
                        telegramChatId: e.target.value,
                      })
                    }
                    className="sub-input"
                  />
                )}
              </div>

              <button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="save-button"
              >
                <Save size={18} /> {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="settings-section">
            <h2>Billing & Subscription</h2>
            {subscription && (
              <div className="subscription-info">
                <div className="info-item">
                  <strong>Current Plan:</strong> {subscription.plan}
                </div>
                <div className="info-item">
                  <strong>Status:</strong> {subscription.status}
                </div>
                {subscription.nextBillingDate && (
                  <div className="info-item">
                    <strong>Next Billing:</strong> {subscription.nextBillingDate}
                  </div>
                )}
              </div>
            )}

            <div className="plans-grid">
              <div className="plan-card">
                <h3>Pro</h3>
                <p className="price">$9<span>/month</span></p>
                <ul className="features">
                  <li>✓ Unlimited tasks</li>
                  <li>✓ AI prioritization</li>
                  <li>✓ Calendar sync</li>
                  <li>✓ Email digest</li>
                </ul>
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={checkoutLoading || subscription?.plan === "pro"}
                  className="upgrade-button"
                >
                  <Zap size={16} />{" "}
                  {subscription?.plan === "pro" ? "Current Plan" : "Upgrade to Pro"}
                </button>
              </div>

              <div className="plan-card featured">
                <div className="featured-badge">Popular</div>
                <h3>Team</h3>
                <p className="price">$29<span>/month</span></p>
                <ul className="features">
                  <li>✓ Everything in Pro</li>
                  <li>✓ Team workspaces</li>
                  <li>✓ Role-based access</li>
                  <li>✓ Activity audit log</li>
                </ul>
                <button
                  onClick={() => handleCheckout("team")}
                  disabled={checkoutLoading || subscription?.plan === "team"}
                  className="upgrade-button featured"
                >
                  <Zap size={16} />{" "}
                  {subscription?.plan === "team"
                    ? "Current Plan"
                    : "Upgrade to Team"}
                </button>
              </div>
            </div>

            {(subscription?.plan === "pro" || subscription?.plan === "team") && (
              <button
                onClick={handleBillingPortal}
                disabled={checkoutLoading}
                className="billing-portal-button"
              >
                Manage Billing Portal
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
