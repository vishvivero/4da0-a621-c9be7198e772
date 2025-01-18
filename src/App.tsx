import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Index from "@/pages/Index";
import Overview from "@/pages/Overview";
import DebtList from "@/pages/DebtList";
import { DebtDetailsPage } from "@/components/debt/DebtDetailsPage";
import About from "@/pages/About";
import Pricing from "@/pages/Pricing";
import Blog from "@/pages/Blog";
import FreeTools from "@/pages/FreeTools";
import Layout from "@/components/layout/Layout";
import Admin from "@/pages/Admin";
import FAQ from "@/pages/FAQ";
import PrivacyPolicy from "@/components/legal/PrivacyPolicy";
import TermsOfService from "@/components/legal/TermsOfService";
import DataProcessingAgreement from "@/components/legal/DataProcessingAgreement";
import Strategy from "@/pages/Strategy";
import Track from "@/pages/Track";
import Profile from "@/pages/Profile";
import MyPlan from "@/pages/MyPlan";
import Help from "@/pages/Help";
import Reports from "@/pages/Reports";
import AmortizationCalculatorPage from "@/pages/tools/AmortizationCalculator";
import InterestCalculatorPage from "@/pages/tools/InterestCalculator";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Layout><Index /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
              <Route path="/blog/*" element={<Layout><Blog /></Layout>} />
              <Route path="/tools" element={<Layout><FreeTools /></Layout>} />
              <Route path="/tools/amortization-calculator" element={<Layout><AmortizationCalculatorPage /></Layout>} />
              <Route path="/tools/interest-calculator" element={<Layout><InterestCalculatorPage /></Layout>} />
              <Route path="/faq" element={<Layout><FAQ /></Layout>} />
              <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
              <Route path="/terms" element={<Layout><TermsOfService /></Layout>} />
              <Route path="/dpa" element={<Layout><DataProcessingAgreement /></Layout>} />
              
              {/* Protected routes */}
              <Route path="/overview" element={<Overview />} />
              <Route path="/overview/debts" element={<DebtList />} />
              <Route path="/overview/debt/:debtId" element={<DebtDetailsPage />} />
              <Route path="/overview/reports" element={<Reports />} />
              <Route path="/strategy" element={<Strategy />} />
              <Route path="/track" element={<Track />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-plan" element={<MyPlan />} />
              <Route path="/help" element={<Help />} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={<Admin />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;