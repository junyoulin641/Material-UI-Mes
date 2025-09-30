import * as React from "react";
import { Navigate } from "react-router-dom";

// Redirect to MES Dashboard as the main dashboard
export default function CrmMainDashboard() {
  return <Navigate to="/mes" replace />;
}