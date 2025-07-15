import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <header className="legal-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Privacy Policy</h1>
      </header>

      <div className="legal-content">
        <section>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
        </section>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            participate in games, or contact us for support.
          </p>
          <ul>
            <li><strong>Account Information:</strong> Username, email address, and password</li>
            <li><strong>Game Data:</strong> Game statistics, deck configurations, and match history</li>
            <li><strong>Technical Information:</strong> IP address, browser type, and device information</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our game services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Improve our game and develop new features</li>
            <li>Prevent fraud and ensure fair play</li>
          </ul>
        </section>

        <section>
          <h2>3. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except in the following circumstances:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and prevent fraud</li>
            <li>In connection with a business transfer</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2>5. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your gaming experience, 
            remember your preferences, and analyze usage patterns.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Withdraw consent for data processing</li>
          </ul>
        </section>

        <section>
          <h2>7. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly 
            collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: privacy@aetherbeasts.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
