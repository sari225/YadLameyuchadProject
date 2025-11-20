import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeToken } from "../../features/auth/authSlice";
import "./Navigation.css";

const AdminNavigation = ({ isOpen, setIsOpen }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);

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
                        <h2 className="sidebar-title">פאנל ניהול</h2>
                    </div>

                    {/* מידע משתמש */}
                    {user && (
                        <div className="user-info">
                            <div className="user-info-name">מנהל מערכת</div>
                            <div className="user-info-email">{user.email}</div>
                        </div>
                    )}

                    {/* תפריט ניווט */}
                    <nav className="nav-list">
                        <NavLink to="/admin/managementPanel" className="nav-item">
                            <i className="far fa-clipboard nav-icon"></i>
                            <span className="nav-text">פאנל ניהול</span>
                        </NavLink>

                        <NavLink to="/admin/childrenManagement" className="nav-item">
                            <i className="far fa-smile nav-icon"></i>
                            <span className="nav-text">ניהול ילדים</span>
                        </NavLink>

                        <NavLink to="/admin/volunteersManagement" className="nav-item">
                            <i className="far fa-heart nav-icon"></i>
                            <span className="nav-text">ניהול מתנדבות</span>
                        </NavLink>
                      <NavLink to="/admin/clubsManagement" className="nav-item">
                            <i className="far fa-star nav-icon"></i>
                            <span className="nav-text">ניהול מועדוניות</span>
                        </NavLink>
                         <NavLink to="/admin/daycampsManagement" className="nav-item">
                            <i className="far fa-calendar-alt nav-icon"></i>
                            <span className="nav-text">ניהול קייטנות</span>
                        </NavLink>
                         <NavLink to="/admin/updatesManagement" className="nav-item">
                            <i className="far fa-newspaper nav-icon"></i>
                            <span className="nav-text">ניהול עדכונים</span>
                        </NavLink>
                        <NavLink to="/admin/documentsManagement" className="nav-item">
                            <i className="far fa-file-alt nav-icon"></i>
                            <span className="nav-text">ניהול טפסים</span>
                        </NavLink>
                        <NavLink to="/admin/contactMessages" className="nav-item">
                            <i className="far fa-envelope nav-icon"></i>
                            <span className="nav-text">הודעות יצירת קשר</span>
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

export default AdminNavigation;