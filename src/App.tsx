import { useRouter } from "@/lib/router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LandingPage } from "@/pages/LandingPage";
import { CustomPage } from "@/pages/CustomPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { AdminLogin } from "@/pages/AdminLogin";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Loader2 } from "lucide-react";

function AppRoutes() {
  const { path, navigate } = useRouter();
  const { session, loading } = useAuth();

  const isAdmin = path.startsWith("/admin");
  const isAdminLogin = path === "/admin/login";

  if (isAdmin && !isAdminLogin && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-birch-50">
        <Loader2 size={28} className="animate-spin text-birch-400" />
      </div>
    );
  }

  if (isAdmin && !isAdminLogin && !session) {
    return <AdminLogin onNavigate={navigate} />;
  }

  if (isAdmin && session) {
    return <AdminDashboard onNavigate={navigate} path={path} />;
  }

  if (isAdminLogin && session) {
    return <AdminDashboard onNavigate={navigate} path={path} />;
  }

  // /pay/:token → customer payment page
  const paymentMatch = path.match(/^\/pay\/(.+)$/);

  // /custom/product/:id → product detail page
  const productDetailMatch = path.match(/^\/custom\/product\/(.+)$/);

  if (paymentMatch) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navbar onNavigate={navigate} currentPath={path} />
        <PaymentPage token={paymentMatch[1]} onNavigate={navigate} />
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar onNavigate={navigate} currentPath={path} />
      {productDetailMatch ? (
        <ProductDetailPage
          productId={productDetailMatch[1]}
          onNavigate={navigate}
          onOrder={() => navigate("/custom")}
        />
      ) : path.startsWith("/custom") ? (
        <CustomPage onNavigate={navigate} />
      ) : (
        <LandingPage onNavigate={navigate} />
      )}
      {!path.startsWith("/custom") && <Footer onNavigate={navigate} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
