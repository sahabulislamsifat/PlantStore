import { Helmet } from "react-helmet-async";
import AdminStatistics from "../../../components/Dashboard/Statistics/AdminStatistics";
import useRole from "../../../hooks/useRole";
import LoadingSpinner from "../../../components/Shared/LoadingSpinner";
import { Navigate } from "react-router-dom";
const Statistics = () => {
  const { role, isLoading } = useRole();
  if (isLoading) return <LoadingSpinner />;
  if (role === "Customer") return <Navigate to="/dashboard/my-orders" />;
  if (role === "Seller") return <Navigate to="/dashboard/my-inventory" />;
  return (
    <div>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      {role === "Admin" && <AdminStatistics />}
    </div>
  );
};

export default Statistics;
