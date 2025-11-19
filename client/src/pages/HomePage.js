import { useEffect, useRef } from "react";
import "./HomePage.css";

export default function HomePage() {
  const counter1 = useRef(null);
  const counter2 = useRef(null);
  const counter3 = useRef(null);
  const counter4 = useRef(null);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const animateCounter = (el, target) => {
      let current = 0;
      const step = target / 100;

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.innerText = Math.floor(current);
      }, 20);
    };

    // Intersection Observer for scroll animations
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Special handling for counters
          if (entry.target.classList.contains('stats-grid')) {
            animateCounter(counter1.current, 10);
            animateCounter(counter2.current, 300);
            animateCounter(counter3.current, 200);
            animateCounter(counter4.current, 30);
          }
        }
      });
    }, observerOptions);

    // Observe elements for scroll animations
    const elementsToObserve = document.querySelectorAll([
      '.logo-img',
      '.hero-text',
      '.quote-bg',
      '.quote-content',
      '.stat-item',
      '.stats-grid',
      '.activity-card',
      '.contact-circle',
      '.contact-details'
    ].join(','));

    elementsToObserve.forEach(el => observer.observe(el));

    // Trigger hero animations on page load
    setTimeout(() => {
      const logoImg = document.querySelector('.logo-img');
      const heroText = document.querySelector('.hero-text');
      if (logoImg) logoImg.classList.add('visible');
      if (heroText) heroText.classList.add('visible');
    }, 100);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-container">

      {/* HEADER */}
      <header className="header">
        <div className="header-logo" onClick={scrollToTop} style={{ cursor: 'pointer' }}>
          <img src="/HOME/LL.png" className="header-logo-img" alt="לוגו LL" />
          <img src="/HOME/LO.png" className="header-logo-img" alt="לוגו LO" />
        </div>
        <nav className="nav-center">
          <a href="#hero" className="nav-btn">אודות</a>
          <a href="#activities" className="nav-btn">הפעילויות שלנו</a>
          <a href="#contact" className="nav-btn">יצירת קשר</a>
        </nav>
        <nav className="nav-left">
          <a href="/login" className="nav-btn primary">כניסה</a>
          <a href="https://secure.cardcom.solutions/e/thY" target="_blank" rel="noopener noreferrer" className="nav-btn donate">תרומה</a>
        </nav>
      </header>


      {/* HERO SECTION */}
      <section className="hero" id="hero">
        <img src="/HOME/D.png" className="bg-full" alt="" />
        <div className="hero-content">
          <img src="/HOME/LOGO.png" className="logo-img" alt="לוגו יד למיוחד" />
          <div className="hero-text">
            <p>מרכז יד למיוחד, שע"י אגודת עזרה למרפא, פועל בביתר עילית החל משנת 2006, בנשיאותו של הרב פירר שליט"א.</p>
            <p>המרכז מציע סיוע רב־תחומי ומגוון רחב של שירותים התנדבותיים עבור אוכלוסיות צמי"ד בביתר עילית והסביבה.</p>
          </div>
        </div>
      </section>


      {/* QUOTE SECTION */}
      <section className="quote">
        <img src="/HOME/B.png" className="quote-bg" alt="" />
        <div className="quote-content">
          <p className="quote-text">
            "יד למיוחד הוא ארגון המביא אור וחום לחיי ילדים מיוחדים ומשפחותיהם. 
            הצוות המסור והמתנדבות המופלאות יוצרים סביבה של אהבה ותמיכה שמשנה חיים באמת."
          </p>
          <span className="quote-author">הורים מודים</span>
        </div>
      </section>


      {/* COUNTERS */}
      <section className="stats" id="about">
        <img src="/HOME/D.png" className="bg-full" alt="" />

        <div className="stats-grid">
          <div className="stat-item">
            <div className="circle">
              <span ref={counter1}>0</span>
            </div>
            <p>מועדוניות</p>
          </div>

          <div className="stat-item">
            <div className="circle">
              <span ref={counter2}>0</span>
            </div>
            <p>מתנדבות</p>
          </div>

          <div className="stat-item">
            <div className="circle">
              <span ref={counter3}>0</span>
            </div>
            <p>ילדים</p>
          </div>

          <div className="stat-item">
            <div className="circle">
              <span ref={counter4}>0</span>
            </div>
            <p>ימי פעילות שנתיים</p>
          </div>
        </div>
      </section>


      {/* ACTIVITIES */}
      <section className="activities-section" id="activities">
        <div className="activities-container">
          <h2 className="activities-title">הפעילויות שלנו</h2>
          <div className="activities-grid">
            <div className="activity-card">
              <div className="activity-image-container">
                <img src="/HOME/MO.JPG" alt="מועדוניות" className="activity-image" />
                <div className="activity-title-overlay">
                  <h3>מועדוניות</h3>
                </div>
                <div className="activity-overlay">
                  <h3>מועדוניות</h3>
                  <p>מסגרת חמה ומפנקת לילדי צמי"ד, הפועלת במספר סניפים בעיר. בימות החול, סופי שבוע , שבתות וחגים.
במועדוניות הילדים נהנים מיחס חם ואישי, ע"י מתנדבת צמודה לכל ילד, הפעלות חוויתיות, הווי חברתי, יצירות, ארוחות משביעות ועוד...</p>
                </div>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-image-container">
                <img src="/HOME/K.JPG" alt="קיטנות" className="activity-image" />
                <div className="activity-title-overlay">
                  <h3>קיטנות</h3>
                </div>
                <div className="activity-overlay">
                  <h3>קיטנות</h3>
                  <p>קייטנות אטרקטיביות הפועלות בימי החופשות לאורך כל השנה:
              חוה"מ סוכות, חנוכה (קייטנת צהריים), ערב פסח, חוה"מ פסח, חופשת קיץ, 
              ימים מיוחדים כמו איסרו חג, תענית אסתר ועוד... בהתאם ללוח החופשות של מוסדות הלימוד.</p>
                </div>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-image-container">
                <img src="/HOME/T.JPG" alt="טיולים וימי כיף" className="activity-image" />
                <div className="activity-title-overlay">
                  <h3>טיולים וימי כיף</h3>
                </div>
                <div className="activity-overlay">
                  <h3>טיולים וימי כיף</h3>
                  <p>אחד מרגעי השיא שאף ילד אינו מוותר עליו, זהו הרגע בו הוא מצטרף לעוד טיול מדהים של עזרה למרפא. המרכז מוציא מס' פעמים בשנה טיולים אטרקטיביים הכוללים אטרקציות ופינוקים רבים להנאת הילדים. מטרת הטיולים היא כפולה:
              לתת מרווח נשימה להורים המתמודדים יום יום עם כל מה שכרוך בגידול ילד מיוחד, ולהעניק לילדים המיוחדים פסק זמן של חוויה ושחרור ע"מ לצבור כוחות מחודשים לחזרה לשגרה של טיפולים, רופאים וקשיים שונים.</p>
                </div>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-image-container">
                <img src="/HOME/MI.JPG" alt="מתנדבות" className="activity-image" />
                <div className="activity-title-overlay">
                  <h3>מתנדבות</h3>
                </div>
                <div className="activity-overlay">
                  <h3>מתנדבות</h3>
                  <p>מערך רחב של חונכות לילדי צמי"ד, שתפקידן לפגוש את הילד פעם-פעמיים בשבוע, להעסיקו ולהעניק לו שעות של יחס אישי וחוויה.<br/>
              מערך מתנדבות לשהיה לצד ילדי צמי"ד מאושפזים בבתי חולים.</p>
                </div>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-image-container">
                <img src="/HOME/SH.jpg" alt="משפחות מארחות" className="activity-image" />
                <div className="activity-title-overlay">
                  <h3>משפחות מארחות</h3>
                </div>
                <div className="activity-overlay">
                  <h3>משפחות מארחות</h3>
                  <p>כשמשפחה מיוחדת מעוניינת לצאת לשבת נופש או לשבת של שמחה משפחתית, היא זקוקה פעמים רבות לסיוע עם הילד המיוחד. במרכז יד למיוחד קיים מאגר משפחות מארחות בשבתות ובימי חול, המעניקות לילד מסגרת חמה, מכילה ובטוחה.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <div className="contact-content">
          <div className="contact-info">
            <h2 className="contact-title">יצירת קשר</h2>
            <p className="contact-description">
             נשמח לעמוד לרשותכם לכל פניה, שאלה או בקשה בנושא הפעילות 
              אנו פועלים בביתר עילית ומזמינים אתכם להיות חלק מהמשפחה שלנו.
            </p>
            <a href="/contact" className="contact-btn">
              שלחו לנו הודעה
            </a>
          </div>
          
          <div className="contact-actions">
            <div className="contact-details">
              <div className="contact-item">
                <span className="contact-label">מייל:</span>
                <span className="contact-value">yadlameyuchad@gmail.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">טלפונים:</span>
                <span className="contact-value">0527650747</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">טלפון נוסף:</span>
                <span className="contact-value">02-5803543</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">כתובת:</span>
                <span className="contact-value">פחד יצחק 35 ביתר עילית</span>
                <a href="https://maps.google.com/maps?q=פחד+יצחק+35+ביתר+עילית" className="waze-link" target="_blank" rel="noopener noreferrer">
                  ניווט במפות
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="footer">
        © כל הזכויות שמורות 2025
      </footer>
    </div>
  );
}
