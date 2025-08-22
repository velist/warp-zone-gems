import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GameDetail from "./pages/GameDetail";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Leaderboard from "./pages/Leaderboard";
import SearchResults from "./pages/SearchResults";
import AdminLogin from "./components/AdminLogin";
import AdminRegister from "./components/AdminRegister";
import DevAdminSetup from "./components/DevAdminSetup";
import AdminDashboard from "./pages/AdminDashboard";
import PostManagement from "./pages/PostManagement";
import PostEditor from "./pages/PostEditor";
import AdminSettings from "./pages/AdminSettings";
import NavigationManager from "./pages/NavigationManager";
import UserAuth from "./components/UserAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { PerformanceMonitor } from "./components/PerformanceMonitor";
import { PopupSystem } from "./components/PopupSystem";
import { FloatingElements } from "./components/FloatingElements";
import { SitemapGenerator } from "./components/SitemapGenerator";
import { AuthProvider } from "./hooks/useAuth";
import "./App.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/game/:id" element={<GameDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/search" element={<SearchResults />} />
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
            <Route 
              path="/admin/navigation" 
              element={
                <ProtectedRoute>
                  <NavigationManager />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </HashRouter>
      {/* SEO和性能组件 */}
      <SitemapGenerator />
      <PerformanceMonitor />
      {/* 弹窗系统 */}
      <PopupSystem />
      {/* 悬浮元素 */}
      <FloatingElements />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
