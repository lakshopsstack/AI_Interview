import { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const RequireCompanyAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const appContext = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !appContext?.company) {
      setLoading(true);
      appContext?.companyVerifyLogin?.()
        .catch(() => {
          localStorage.removeItem("token");
          setError(true);
        })
        .finally(() => setLoading(false));
    }
  }, [appContext]);

  const token = localStorage.getItem("token");
  if (!token || error) {
    return <Navigate to="/employer/login" state={{ from: location }} replace />;
  }
  if (loading || !appContext?.company) {
    return <LoadingSpinner />;
  }
  return <>{children}</>;
};

export default RequireCompanyAuth; 