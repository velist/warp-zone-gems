import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GameDetail from "./pages/GameDetail";
import AdminLogin from "./components/AdminLogin";
import AdminRegister from "./components/AdminRegister";
import DevAdminSetup from "./components/DevAdminSetup";
import AdminDashboard from "./pages/AdminDashboard";
import PostManagement from "./pages/PostManagement";
import PostEditor from "./pages/PostEditor";
import AdminSettings from "./pages/AdminSettings";
import UserAuth from "./components/UserAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/auth" element={<UserAuth />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin/dev-setup" element={<DevAdminSetup />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/posts" 
              element={
                <ProtectedRoute>
                  <PostManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/posts/create" 
              element={
                <ProtectedRoute>
                  <PostEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/posts/edit/:id" 
              element={
                <ProtectedRoute>
                  <PostEditor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
