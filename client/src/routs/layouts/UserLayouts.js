import { Outlet } from "react-router-dom";
import UserNavigation from "../navigations/UserNavigation";
const UserLayouts = () => { 
    return (
        <div>
            <UserNavigation />
            <Outlet />
        </div>
    )
 };

export default UserLayouts;