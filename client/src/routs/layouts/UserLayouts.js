import { Outlet } from "react-router-dom";
import UserNavigation from "../navigations/UserNavigation";
import { useState } from "react";

const UserLayouts = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(180deg, #eaf6ff 0%, #f6fbff 100%)' }}>
            <UserNavigation isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
            <div style={{
                flex: 1,
                marginRight: isNavOpen ? '280px' : '0', // RTL: התפריט בצד ימין
                transition: 'margin-right 0.3s ease',
                overflow: 'auto'
            }}>
                <Outlet />
            </div>
        </div>
    );
};

export default UserLayouts;