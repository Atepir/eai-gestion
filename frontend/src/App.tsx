import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OwnerListPage } from './pages/owners/OwnerListPage';
import { PropertyListPage } from './pages/properties/PropertyListPage';
import { PropertyFormPage } from './pages/properties/PropertyFormPage';
import { PropertyDetailPage } from './pages/properties/PropertyDetailPage';
import { TenantListPage } from './pages/tenants/TenantListPage';
import { TenantFormPage } from './pages/tenants/TenantFormPage';
import { TenantDetailPage } from './pages/tenants/TenantDetailPage';
import { ContractListPage } from './pages/contracts/ContractListPage';
import { ContractFormPage } from './pages/contracts/ContractFormPage';
import { ContractDetailPage } from './pages/contracts/ContractDetailPage';
import { InvoiceListPage } from './pages/invoices/InvoiceListPage';
import { InvoiceDetailPage } from './pages/invoices/InvoiceDetailPage';
import { PaymentListPage, PaymentFormPage } from './pages/payments/PaymentListPage';
import { MeterListPage, MeterReadingPage } from './pages/meters/MeterListPage';
import { TerminationListPage, TerminationFormPage, TerminationDetailPage } from './pages/terminations/TerminationListPage';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/owners" element={<OwnerListPage />} />
                    <Route path="/properties" element={<PropertyListPage />} />
                    <Route path="/properties/new" element={<PropertyFormPage />} />
                    <Route path="/properties/:id" element={<PropertyDetailPage />} />
                    <Route path="/properties/:id/edit" element={<PropertyFormPage />} />
                    <Route path="/tenants" element={<TenantListPage />} />
                    <Route path="/tenants/new" element={<TenantFormPage />} />
                    <Route path="/tenants/:id" element={<TenantDetailPage />} />
                    <Route path="/tenants/:id/edit" element={<TenantFormPage />} />
                    <Route path="/contracts" element={<ContractListPage />} />
                    <Route path="/contracts/new" element={<ContractFormPage />} />
                    <Route path="/contracts/:id" element={<ContractDetailPage />} />
                    <Route path="/invoices" element={<InvoiceListPage />} />
                    <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
                    <Route path="/payments" element={<PaymentListPage />} />
                    <Route path="/payments/new" element={<PaymentFormPage />} />
                    <Route path="/meters" element={<MeterListPage />} />
                    <Route path="/meters/:propertyId/readings" element={<MeterReadingPage />} />
                    <Route path="/terminations" element={<TerminationListPage />} />
                    <Route path="/terminations/new" element={<TerminationFormPage />} />
                    <Route path="/terminations/:id" element={<TerminationDetailPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </AuthProvider>
    );
}
