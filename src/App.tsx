
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { ProtectedRoute } from "@/providers/ProtectedRoute";

import Index from "./pages/Index";
import MergePage from "./pages/MergePage";
import SplitPage from "./pages/SplitPage";
import CompressPage from "./pages/CompressPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import SubscriptionPage from "./pages/SubscriptionPage";
import HelpPage from "./pages/HelpPage";
import SettingsPage from "./pages/SettingsPage";
import FilesPage from "./pages/FilesPage";
import ReportsPage from "./pages/ReportsPage";
import ViewerPage from "./pages/ViewerPage";
import MyFilesPage from "./pages/MyFilesPage";
import ToolsPage from "./pages/ToolsPage";
import PremiumToolsPage from "./pages/PremiumToolsPage";

// Import placeholder pages for conversion tools
import ConversionPage from "./pages/placeholders/ConversionPage";
import SignPdfPage from "./pages/placeholders/SignPdfPage";
import EditPdfPage from "./pages/placeholders/EditPdfPage";
import WatermarkPdfPage from "./pages/placeholders/WatermarkPdfPage";
import ProtectPdfPage from "./pages/placeholders/ProtectPdfPage";
import OrganizePdfPage from "./pages/placeholders/OrganizePdfPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin", "visitor"]}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscription"
              element={
                <ProtectedRoute>
                  <SubscriptionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/files"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <FilesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/merge"
              element={
                <ProtectedRoute>
                  <MergePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/split"
              element={
                <ProtectedRoute>
                  <SplitPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compress"
              element={
                <ProtectedRoute>
                  <CompressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/view"
              element={
                <ProtectedRoute>
                  <ViewerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-files"
              element={
                <ProtectedRoute>
                  <MyFilesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tools"
              element={
                <ProtectedRoute>
                  <ToolsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/premium-tools"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <PremiumToolsPage />
                </ProtectedRoute>
              }
            />
            
            {/* Conversion tool routes */}
            <Route
              path="/pdf-to-word"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="pdf-to-word" title="Convertir PDF en Word" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdf-to-excel"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="pdf-to-excel" title="Convertir PDF en Excel" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdf-to-powerpoint"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="pdf-to-powerpoint" title="Convertir PDF en PowerPoint" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pdf-to-jpg"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="pdf-to-jpg" title="Convertir PDF en JPG" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/word-to-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="word-to-pdf" title="Convertir Word en PDF" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/excel-to-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="excel-to-pdf" title="Convertir Excel en PDF" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/powerpoint-to-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="powerpoint-to-pdf" title="Convertir PowerPoint en PDF" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jpg-to-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ConversionPage type="jpg-to-pdf" title="Convertir JPG en PDF" />
                </ProtectedRoute>
              }
            />
            
            {/* New additional tools */}
            <Route
              path="/sign-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <SignPdfPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <EditPdfPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/watermark-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <WatermarkPdfPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/protect-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <ProtectPdfPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organize-pdf"
              element={
                <ProtectedRoute allowedRoles={["subscriber", "super_admin"]}>
                  <OrganizePdfPage />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
