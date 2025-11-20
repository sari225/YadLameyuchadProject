import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateMessageMutation } from "../api/messageApi";
import { parseServerError } from "../utils/errorHandler";
import "./ContactPage.css";

export default function ContactPage() {
  const navigate = useNavigate();
  const [createMessage, { isLoading }] = useCreateMessageMutation();

  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    topic: "",
    content: "",
  });

  const [errors, setErrors] = useState({});
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const topics = ["שאלה", "תלונה", "בקשה"];

  // מונע גלילה רק בדף יצירת הקשר
  useEffect(() => {
    // שמירת המצב הקודם
    const originalOverflow = document.body.style.overflow;
    
    // הגדרת אי-גלילה לדף יצירת קשר
    document.body.style.overflow = 'hidden';
    
    // ניקוי בעת יציאה מהרכיב
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.senderName.trim()) newErrors.senderName = "שם מלא הוא שדה חובה";

    if (!formData.senderEmail.trim()) {
      newErrors.senderEmail = "מייל הוא שדה חובה";
    } else if (
      !/^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/.test(
        formData.senderEmail
      )
    ) {
      newErrors.senderEmail = "כתובת מייל לא תקינה";
    }

    if (!formData.topic) newErrors.topic = "נושא הוא שדה חובה";

    if (!formData.content.trim()) newErrors.content = "תוכן הפנייה הוא שדה חובה";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createMessage(formData).unwrap();

      setMessage("ההודעה נשלחה בהצלחה! מחזיר אותך לעמוד הבית...");
      setMessageType("success");
      setShowMessage(true);

      setFormData({
        senderName: "",
        senderEmail: "",
        topic: "",
        content: "",
      });

      // חזרה אוטומטית לעמוד הבית אחרי 2 שניות
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      const errorMessage = parseServerError(error, "שגיאה בשליחת ההודעה");
      setMessage(errorMessage);
      setMessageType("error");
      setShowMessage(true);
      
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
    }
  };

  return (
    <div className="contact-page">
      {/* Background Image */}
      <div className="background-image">
        <img src="/HOME/A.png" alt="רקע" />
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate("/")}>
        <span className="arrow">→</span>
      </button>

      {/* Main Content */}
      <div className="contact-container">
        {/* Contact Form */}
        <div className="contact-form-section">
          <h1 className="page-title">יצירת קשר</h1>
          
          {showMessage && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <input
                type="text"
                name="senderName"
                placeholder="שם מלא *"
                value={formData.senderName}
                onChange={handleChange}
                className={errors.senderName ? 'error' : ''}
              />
              {errors.senderName && <span className="error-text">{errors.senderName}</span>}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="senderEmail"
                placeholder="כתובת מייל *"
                value={formData.senderEmail}
                onChange={handleChange}
                className={errors.senderEmail ? 'error' : ''}
              />
              {errors.senderEmail && <span className="error-text">{errors.senderEmail}</span>}
            </div>

            <div className="form-group">
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className={errors.topic ? 'error' : ''}
              >
                <option value="">בחר נושא *</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              {errors.topic && <span className="error-text">{errors.topic}</span>}
            </div>

            <div className="form-group">
              <textarea
                name="content"
                placeholder="תוכן הפנייה *"
                value={formData.content}
                onChange={handleChange}
                rows="5"
                className={errors.content ? 'error' : ''}
              ></textarea>
              {errors.content && <span className="error-text">{errors.content}</span>}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "שולח..." : "שלח הודעה"}
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="contact-info-section">
          <h2>פרטי התקשרות</h2>
          
          <div className="contact-details">
            <div className="contact-item">
              <div className="contact-label">כתובת:</div>
              <div className="contact-value">פחד יצחק 35 ביתר עילית</div>
              <a href="https://maps.google.com/maps?q=פחד+יצחק+35+ביתר+עילית" 
                 className="map-link" target="_blank" rel="noopener noreferrer">
                הצג במפות גוגל
              </a>
            </div>

            <div className="contact-item">
              <div className="contact-label">טלפון:</div>
              <div className="contact-value">0527650747</div>
            </div>

            <div className="contact-item">
              <div className="contact-label">טלפון נוסף:</div>
              <div className="contact-value">02-5803543</div>
            </div>

            <div className="contact-item">
              <div className="contact-label">מייל:</div>
              <div className="contact-value">yadlameyuchad@gmail.com</div>
            </div>

            <div className="contact-item working-hours">
              <div className="contact-label">שעות פעילות:</div>
              <div className="contact-value">ימים א'-ה': 9:00–17:00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 