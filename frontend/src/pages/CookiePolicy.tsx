import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LegalPages.css';

const CookiePolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <header className="legal-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Cookie Policy</h1>
      </header>

      <div className="legal-content">
        <section>
          <p><strong>Last updated:</strong> {new Date().toLocaleDateString()}</p>
        </section>

        <section>
          <h2>1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you 
            visit our website. They are widely used to make websites work more efficiently and provide 
            information to website owners.
          </p>
        </section>

        <section>
          <h2>2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
            <li><strong>Authentication:</strong> Keep you logged in during your session</li>
            <li><strong>Preferences:</strong> Remember your game settings and preferences</li>
            <li><strong>Analytics:</strong> Help us understand how players use our game</li>
            <li><strong>Performance:</strong> Improve loading times and game performance</li>
          </ul>
        </section>

        <section>
          <h2>3. Types of Cookies We Use</h2>
          
          <h3>Essential Cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services available through our 
            website and to use some of its features, such as access to secure areas.
          </p>

          <h3>Functional Cookies</h3>
          <p>
            These cookies allow the website to provide enhanced functionality and personalization, 
            such as remembering your username and game preferences.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with our website by collecting 
            and reporting information anonymously.
          </p>

          <h3>Performance Cookies</h3>
          <p>
            These cookies allow us to count visits and traffic sources so we can measure and improve 
            the performance of our site and game.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Cookies</h2>
          <p>
            We may use third-party services that place cookies on your device. These services help us 
            analyze website traffic and improve user experience.
          </p>
        </section>

        <section>
          <h2>5. Managing Cookies</h2>
          <p>
            You can control and manage cookies in various ways. Please note that removing or blocking 
            cookies can impact your user experience and parts of our website may no longer be fully accessible.
          </p>
          
          <h3>Browser Settings</h3>
          <p>
            Most web browsers allow you to control cookies through their settings preferences. 
            However, limiting cookies may impact your experience of our website.
          </p>

          <h3>Our Cookie Consent Tool</h3>
          <p>
            When you first visit our website, you'll see a cookie consent banner where you can choose 
            which types of cookies to accept.
          </p>
        </section>

        <section>
          <h2>6. Cookie Retention</h2>
          <p>
            Cookies are stored for different periods depending on their purpose:
          </p>
          <ul>
            <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent Cookies:</strong> Remain for a set period (typically 30 days to 2 years)</li>
            <li><strong>Authentication Cookies:</strong> Remain until you log out or expire after inactivity</li>
          </ul>
        </section>

        <section>
          <h2>7. Updates to This Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology, 
            legislation, or our business practices.
          </p>
        </section>

        <section>
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about our use of cookies, please contact us at:
            <br />
            Email: cookies@aetherbeasts.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default CookiePolicy;
