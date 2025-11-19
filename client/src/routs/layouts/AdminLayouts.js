import { Outlet } from "react-router-dom";
import AdminNavigation from "../navigations/AdminNavigation";
import { useState } from "react";

const AdminLayouts = () => {
    const [isNavOpen, setIsNavOpen] = useState(true);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(180deg, #eaf6ff 0%, #f6fbff 100%)' }}> 
           <AdminNavigation isOpen={isNavOpen} setIsOpen={setIsNavOpen} />
           <div 
               className="main-content"
               style={{
                   flex: 1,
                   marginRight: isNavOpen ? '280px' : '0',
                   transition: 'margin-right 0.3s ease',
                   overflow: 'auto'
               }}
           >
               <Outlet /> 
           </div>
        </div>
    )
};
    
export default AdminLayouts;