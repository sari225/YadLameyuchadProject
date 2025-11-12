import { Outlet } from "react-router-dom";
import AdminNavigation from "../navigations/AdminNavigation";
const AdminLayouts = () => {
    return (
        <div> 
           <AdminNavigation />
           <Outlet /> 
        </div>
    )
    };
    
export default AdminLayouts;