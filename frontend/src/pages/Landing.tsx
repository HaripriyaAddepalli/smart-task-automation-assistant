import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Brain, Share2, BarChart3, ArrowRight } from "lucide-react";
import "./Landing.css";

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>AI-Powered Task Automation</h1>
          <p>
            Transform your workflow with intelligent task prioritization, real-time
            collaboration, and AI-generated insights.
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/login")}
              className="cta-button primary"
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button className="cta-button secondary">
              Watch Demo
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <span>✨ AI-Generated</span>
          </div>
          <div className="floating-card">
            <span>🎯 Prioritized</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <Brain size={32} />
            <h3>AI Prioritization</h3>
            <p>
              Automatically prioritize your tasks based on deadlines, importance,
              and dependencies using advanced AI algorithms.
            </p>
          </div>

          <div className="feature-card">
            <Zap size={32} />
            <h3>Voice Commands</h3>
            <p>
              Create and manage tasks hands-free with natural language voice
              recognition. Just speak your tasks aloud.
            </p>
          </div>

          <div className="feature-card">
            <Share2 size={32} />
            <h3>Team Collaboration</h3>
            <p>
              Create workspaces, invite team members, assign tasks, and track
              progress in real-time with live updates.
            </p>
          </div>

          <div className="feature-card">
            <BarChart3 size={32} />
            <h3>Gamification</h3>
            <p>
              Earn XP, build streaks, unlock badges, and compete on leaderboards
              to stay motivated and productive.
            </p>
          </div>

          <div className="feature-card">
            <span className="icon">📧</span>
            <h3>Smart Integrations</h3>
            <p>
              Sync with Google Calendar, receive email digests, and get alerts via
              WhatsApp or Telegram.
            </p>
          </div>

          <div className="feature-card">
            <span className="icon">💳</span>
            <h3>Flexible Plans</h3>
            <p>
              Choose from Free, Pro, or Team plans with transparent pricing and no
              hidden fees. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-preview">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <h3>Free</h3>
            <p className="price">$0<span>/month</span></p>
            <ul>
              <li>✓ Up to 50 tasks</li>
              <li>✓ Voice commands</li>
              <li>✓ Task creation</li>
            </ul>
            <button className="pricing-button">Get Started</button>
          </div>

          <div className="pricing-card featured">
            <div className="badge">Popular</div>
            <h3>Pro</h3>
            <p className="price">$9<span>/month</span></p>
            <ul>
              <li>✓ Unlimited tasks</li>
              <li>✓ AI prioritization</li>
              <li>✓ Calendar sync</li>
              <li>✓ Email digests</li>
            </ul>
            <button className="pricing-button featured">Start Free Trial</button>
          </div>

          <div className="pricing-card">
            <h3>Team</h3>
            <p className="price">$29<span>/month</span></p>
            <ul>
              <li>✓ Everything in Pro</li>
              <li>✓ Team workspaces</li>
              <li>✓ Admin controls</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="pricing-button">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Transform Your Productivity?</h2>
        <p>Join thousands of users who are working smarter, not harder.</p>
        <button
          onClick={() => navigate("/login")}
          className="cta-button large"
        >
          Start Your Free Trial Today
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy</a></li>
              <li><a href="#terms">Terms</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 AI Task Assistant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
