/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/shell/AppShell';

// Public & Auth Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PricingPage } from './pages/PricingPage';

// Workspace Pages
import { DashboardPage } from './pages/DashboardPage';
import { NewRequestPage } from './pages/NewRequestPage';
import { GeneratingQuotePage } from './pages/GeneratingQuotePage';
import { QuoteEditorPage } from './pages/QuoteEditorPage';
import { QuoteDetailPage } from './pages/QuoteDetailPage';
import { QuotePreviewPage } from './pages/QuotePreviewPage';
import { QuotesListPage } from './pages/QuotesListPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { CustomersListPage } from './pages/CustomersListPage';
import { CustomerDetailPage } from './pages/CustomerDetailPage';
import { CustomerFormPage } from './pages/CustomerFormPage';
import { CatalogueListPage } from './pages/CatalogueListPage';
import { CatalogueItemFormPage } from './pages/CatalogueItemFormPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ActivityPage } from './pages/ActivityPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AccessDeniedPage } from './pages/AccessDeniedPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Authenticated Workspace Shell */}
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />

            {/* Pricing & Subscription */}
            <Route path="pricing" element={<PricingPage />} />

            {/* Requests & Generation */}
            <Route path="requests/new" element={<NewRequestPage />} />
            <Route path="requests/:requestId/generating" element={<GeneratingQuotePage />} />

            {/* Quotations */}
            <Route path="quotes" element={<QuotesListPage />} />
            <Route path="quotes/:quoteId" element={<QuoteDetailPage />} />
            <Route path="quotes/:quoteId/edit" element={<QuoteEditorPage />} />
            <Route path="quotes/:quoteId/preview" element={<QuotePreviewPage />} />

            {/* Approvals */}
            <Route path="approvals" element={<ApprovalsPage />} />

            {/* Customers */}
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="customers/new" element={<CustomerFormPage />} />
            <Route path="customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="customers/:customerId/edit" element={<CustomerFormPage />} />

            {/* Catalogue */}
            <Route path="catalogue" element={<CatalogueListPage />} />
            <Route path="catalogue/new" element={<CatalogueItemFormPage />} />
            <Route path="catalogue/:itemId/edit" element={<CatalogueItemFormPage />} />

            {/* Templates, Activity, Notifications */}
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="activity" element={<ActivityPage />} />
            <Route path="notifications" element={<NotificationsPage />} />

            {/* Settings */}
            <Route path="settings" element={<Navigate to="/app/settings/business" replace />} />
            <Route path="settings/:subtab" element={<SettingsPage />} />

            {/* System */}
            <Route path="access-denied" element={<AccessDeniedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
