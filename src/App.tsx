import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import Home from "./pages/Home";
import Profiles from "./pages/Profiles";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import RegisterHouse from "./pages/RegisterHouse";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Houses from "./pages/Admin/Houses";
import BlogManagement from "./pages/Admin/BlogManagement";
import Stats from "./pages/Admin/Stats";
import Reports from "./pages/Admin/Reports";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import HoverReceiver from "@/visual-edits/VisualEditsMessenger";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HoverReceiver />
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Public routes with navbar and footer */}
              <Route
                path="/"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <Home />
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/profiles"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <Profiles />
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/blog"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <Blog />
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/blog/:slug"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <BlogPost />
                    <Footer />
                  </div>
                }
              />
              <Route
                path="/register-house"
                element={
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <RegisterHouse />
                    <Footer />
                  </div>
                }
              />
              <Route path="/auth" element={<Auth />} />

              {/* Admin login route (public) */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin routes (protected) */}
              <Route 
                path="/admin" 
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="houses" element={<Houses />} />
                <Route path="blog" element={<BlogManagement />} />
                <Route path="stats" element={<Stats />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;