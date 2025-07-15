import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <header className="legal-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Terms of Service</h1>
      </header>

      <div className="legal-content">
        <section>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
        </section>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Aether Beasts, you agree to be bound by these Terms of Service 
            and our Privacy Policy. If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Aether Beasts is an online multiplayer card game featuring mythological creatures and 
            strategic gameplay. The service includes account creation, deck building, and real-time battles.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <ul>
            <li>You must be at least 13 years old to create an account</li>
            <li>You are responsible for maintaining the security of your account</li>
            <li>You must provide accurate and complete information</li>
            <li>One account per person is allowed</li>
            <li>You are responsible for all activities under your account</li>
          </ul>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use cheats, exploits, or unauthorized third-party software</li>
            <li>Harass, threaten, or abuse other players</li>
            <li>Share your account credentials with others</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the service for any illegal activities</li>
            <li>Create multiple accounts to circumvent restrictions</li>
          </ul>
        </section>

        <section>
          <h2>5. Fair Play Policy</h2>
          <p>
            We are committed to maintaining a fair and enjoyable gaming environment. Any form of 
            cheating, exploitation, or unsportsmanlike conduct may result in account suspension or termination.
          </p>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <p>
            All content in Aether Beasts, including but not limited to graphics, text, sounds, and code, 
            is owned by us or our licensors and is protected by copyright and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2>7. Virtual Items and Currency</h2>
          <p>
            Any virtual items, cards, or currency in the game have no real-world value and cannot be 
            exchanged for real money or transferred outside the game.
          </p>
        </section>

        <section>
          <h2>8. Service Availability</h2>
          <p>
            We strive to maintain service availability but cannot guarantee uninterrupted access. 
            We reserve the right to modify, suspend, or discontinue the service at any time.
          </p>
        </section>

        <section>
          <h2>9. Limitation of Liability</h2>
          <p>
            We are not liable for any indirect, incidental, special, or consequential damages arising 
            from your use of the service.
          </p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after changes 
            constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2>11. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violation of these terms or 
            for any other reason at our discretion.
          </p>
        </section>

        <section>
          <h2>12. Contact Information</h2>
          <p>
            For questions about these Terms of Service, contact us at:
            <br />
            Email: legal@aetherbeasts.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
