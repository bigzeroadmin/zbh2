import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PortalLayout from './layouts/PortalLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Software from './pages/Software';
import Help from './pages/Help';
import HelpDetail from './pages/HelpDetail';
import Activation from './pages/Activation';
import MyCodes from './pages/MyCodes';
import Tickets from './pages/Tickets';
import SaasPortal from './pages/SaasPortal';
import AiChat from './pages/AiChat';
import Dashboard from './pages/admin/Dashboard';
import SoftwareCategories from './pages/admin/SoftwareCategories';
import SoftwareItems from './pages/admin/SoftwareItems';
import HelpCategories from './pages/admin/HelpCategories';
import HelpDocuments from './pages/admin/HelpDocuments';
import ActivationProducts from './pages/admin/ActivationProducts';
import ActivationCodes from './pages/admin/ActivationCodes';
import ActivationGrants from './pages/admin/ActivationGrants';
import Users from './pages/admin/Users';
import TicketManage from './pages/admin/TicketManage';
import AssetManage from './pages/admin/AssetManage';
import AssetCategories from './pages/admin/AssetCategories';
import SaasManage from './pages/admin/SaasManage';
import Reports from './pages/admin/Reports';
import FaqManage from './pages/admin/FaqManage';
import MonitorDashboard from './pages/admin/MonitorDashboard';
import MonitorTargets from './pages/admin/MonitorTargets';
import MonitorItems from './pages/admin/MonitorItems';
import MonitorAlerts from './pages/admin/MonitorAlerts';
import MonitorReports from './pages/admin/MonitorReports';
import AuditLogs from './pages/admin/AuditLogs';
import MonitorPlatforms from './pages/admin/MonitorPlatforms';

export default function App() {
  return (
    <Routes>
      <Route element={<PortalLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/software" element={<Software />} />
        <Route path="/help" element={<Help />} />
        <Route path="/help/:id" element={<HelpDetail />} />
        <Route path="/activation" element={<Activation />} />
        <Route path="/my-codes" element={<MyCodes />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/cloud-services" element={<SaasPortal />} />
        <Route path="/ai-chat" element={<AiChat />} />
        <Route path="/login" element={<Login />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="software-categories" element={<SoftwareCategories />} />
        <Route path="software-items" element={<SoftwareItems />} />
        <Route path="help-categories" element={<HelpCategories />} />
        <Route path="help-documents" element={<HelpDocuments />} />
        <Route path="activation-products" element={<ActivationProducts />} />
        <Route path="activation-codes" element={<ActivationCodes />} />
        <Route path="activation-grants" element={<ActivationGrants />} />
        <Route path="users" element={<Users />} />
        <Route path="tickets" element={<TicketManage />} />
        <Route path="assets" element={<AssetManage />} />
        <Route path="asset-categories" element={<AssetCategories />} />
        <Route path="saas" element={<SaasManage />} />
        <Route path="reports" element={<Reports />} />
        <Route path="faq" element={<FaqManage />} />
        <Route path="monitor" element={<MonitorDashboard />} />
        <Route path="monitor/targets" element={<MonitorTargets />} />
        <Route path="monitor/items" element={<MonitorItems />} />
        <Route path="monitor/alerts" element={<MonitorAlerts />} />
        <Route path="monitor/reports" element={<MonitorReports />} />
        <Route path="audit" element={<AuditLogs />} />
        <Route path="monitor/platforms" element={<MonitorPlatforms />} />
      </Route>
    </Routes>
  );
}
