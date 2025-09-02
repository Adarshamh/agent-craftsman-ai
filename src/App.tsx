import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PromptStudio from "./pages/PromptStudio";
import DebugConsole from "./pages/DebugConsole";
import CodegenLab from "./pages/CodegenLab";
import TestRunner from "./pages/TestRunner";
import Knowledge from "./pages/Knowledge";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AIAgent } from "./pages/AIAgent";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Home />} />
              <Route path="ai-agent" element={<AIAgent />} />
              <Route path="prompt-studio" element={<PromptStudio />} />
              <Route path="debug-console" element={<DebugConsole />} />
              <Route path="codegen-lab" element={<CodegenLab />} />
              <Route path="test-runner" element={<TestRunner />} />
              <Route path="knowledge" element={<Knowledge />} />
              <Route path="history" element={<History />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
