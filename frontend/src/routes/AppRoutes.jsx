import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Customers } from '../pages/Customers';
import { CustomerDetails } from '../pages/CustomerDetails';
import { Alerts } from '../pages/Alerts';
import { Transactions } from '../pages/Transactions';
import { Complaints } from '../pages/Complaints';
import { Explainability } from '../pages/Explainability';
import { RecurringIssues } from '../pages/RecurringIssues';
import { AgentInvestigation } from '../pages/AgentInvestigation';
import { WhatIf } from '../pages/WhatIf';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/:customerId" element={<CustomerDetails />} />
      <Route path="/explainability" element={<Explainability />} />
      <Route path="/recurring-issues" element={<RecurringIssues />} />
      <Route path="/investigation" element={<AgentInvestigation />} />
      <Route path="/what-if" element={<WhatIf />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/transactions" element={<Transactions />} />
      <Route path="/complaints" element={<Complaints />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
