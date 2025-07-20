import { FC, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import { toast } from "sonner";

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: FC<RequireAuthProps> = ({ children }) => {
  const location = useLocation();
  const appContext = useContext(AppContext);
  if (!appContext) {
    toast.error("Something went wrong");
    return null;
  }

  // Protect /admin-dashboard with admin_token
  if (location.pathname.startsWith("/admin-dashboard")) {
    const adminToken = localStorage.getItem("admin_token");
    if (!adminToken) {
      return <Navigate to="/jobseeker/login" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  }

  // Default: require jobseeker or company auth (expand as needed)
  const jobseekerToken = localStorage.getItem("jobseeker_token");
  const companyToken = localStorage.getItem("token");
  if (!jobseekerToken && !companyToken) {
    return <Navigate to="/jobseeker/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

export default RequireAuth;
