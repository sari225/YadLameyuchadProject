import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeToken } from "../../features/auth/authSlice";
import { useState } from "react";
import "./Navigation.css";

const UserNavigation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [isOpen, setIsOpen] = useState(true);

    const handleLogout = () => {
        dispatch(removeToken());
        navigate("/login");
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="sidebar-container">
            {/* כפתור פתיחה/סגירה - מחוץ לתפריט אבל בתוך הקונטיינר */}
            <button 
                onClick={toggleSidebar} 
                className={`toggle-btn ${isOpen ? '' : 'closed'}`}
            >
                <i className={`fas fa-chevron-${isOpen ? 'right' : 'left'}`}></i>
            </button>

            <div className={`sidebar ${isOpen ? '' : 'closed'}`}>
                    {/* כותרת */}
                    <div className="sidebar-header">
                        <img 
                            src="/images/logo.png" 
                            alt="לוגו" 
                            className="sidebar-logo"
                            onError={(e) => e.target.style.display = 'none'}
                        />
                        <h2 className="sidebar-title">אזור משתמש</h2>
                    </div>

                    {/* מידע משתמש */}
                    {user && (
                        <div className="user-info">
                            <div className="user-info-name">שלום!</div>
                            <div className="user-info-email">{user.email}</div>
                        </div>
                    )}

                    {/* תפריט ניווט */}
                    <nav className="nav-list">
                        <NavLink to="/user/personalArea" className="nav-item">
                            <i className="far fa-user nav-icon"></i>
                            <span className="nav-text">אזור אישי</span>
                        </NavLink>

                        <NavLink to="/user/daycamps" className="nav-item">
                            <i className="far fa-calendar-alt nav-icon"></i>
                            <span className="nav-text">קיטנות</span>
                        </NavLink>

                        <NavLink to="/user/clubs" className="nav-item">
                            <i className="far fa-star nav-icon"></i>
                            <span className="nav-text">מועדוניות</span>
                        </NavLink>

                        <NavLink to="/user/documents" className="nav-item">
                            <i className="far fa-file-alt nav-icon"></i>
                            <span className="nav-text">טפסים</span>
                        </NavLink>

                        <div className="nav-divider"></div>

                        <button onClick={handleLogout} className="logout-item">
                            <i className="fas fa-sign-out-alt nav-icon"></i>
                            <span className="nav-text">התנתק</span>
                        </button>
                    </nav>
                </div>
        </div>
    );
};

export default UserNavigation;