import React, { useRef } from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {

  // רפרנסים לשלושת החלקים
  const aboutRef = useRef(null);
  const activityRef = useRef(null);
  const contactRef = useRef(null);

  

  // פונקציות גלילה רכה
  const scrollToAbout = () => {
    aboutRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToActivity = () => {
    activityRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    contactRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-container" lang="he" dir="rtl">
      <header className="site-header" role="banner">
        <div className="header-inner">
          <img src="./images/logo.png" alt="לוגו יד למיוחד" className="logo" />

          {/* תפריט ניווט */}
          <nav className="nav-links">
            <button onClick={scrollToAbout}>אודות</button>
            <button onClick={scrollToActivity}>הפעילות שלנו</button>
            <button onClick={scrollToContact}>יצירת קשר</button>
          </nav>
          <Link to="/login" className="header-login-button">
            <i className="fas fa-user-circle"></i>
            <span>כניסה</span>
          </Link>
          <a href="https://secure.cardcom.solutions/e/thY" target="_blank" rel="noopener noreferrer" className="header-donate-button">
            <i className="fas fa-heart"></i>
            <span>תרומה</span>
          </a>
        </div>
      </header>

      {/* אזור תוכן – רק כדי להדגים את הגלילה */}
      <main style={{ marginTop: "20vh" }}>
        <section ref={aboutRef} className="section about-section">
          <h2>אודות</h2>
          <div className="about-content">
            <p>מרכז יד למיוחד שע"י אגודת עזרה למרפא פועל בביתר עילית החל משנת 2006, בנשיאותו של הרב פירר שליט"א</p>
            <p>המרכז מציע סיוע רב תחומי ומגוון רחב של שירותים התנדבותיים עבור אוכלוסיית צמי"ד בביתר עילית והסביבה</p>
          </div>
        </section>

        <section ref={activityRef} className="section">
          <h2>הפעילות שלנו</h2>
          <p>כאן יהיה פירוט קצר על סוגי הפעילויות שלנו.</p>
        </section>

        <section ref={contactRef} className="section">
          <h2>יצירת קשר</h2>
          <p>יש לך שאלה, בקשה או פנייה? נשמח לשמוע ממך!</p>
          <Link to="/contact" className="contact-link-button">
            פנה אלינו
          </Link>
        </section>
      </main>
    </div>
  );
}
