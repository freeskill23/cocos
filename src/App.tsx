import { useRouter } from "@/lib/router";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShopPage } from "@/pages/ShopPage";
import { CustomPage } from "@/pages/CustomPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { PaymentPage } from "@/pages/PaymentPage";
import { AuthPage } from "@/pages/AuthPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
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

  // /product/:id → product detail page
  const productMatch = path.match(/^\/product\/(.+)$/);

  // /category/:id → shop page filtered by category
  const categoryMatch = path.match(/^\/category\/(.+)$/);

  // /custom/product/:id → legacy product detail (redirect to /product/:id)
  const legacyProductMatch = path.match(/^\/custom\/product\/(.+)$/);

  if (paymentMatch) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navbar onNavigate={navigate} currentPath={path} />
        <PaymentPage token={paymentMatch[1]} onNavigate={navigate} />
        <Footer onNavigate={navigate} />
      </div>
    );
  }

  const productId = productMatch?.[1] ?? legacyProductMatch?.[1];

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar onNavigate={navigate} currentPath={path} />
      {path === "/auth" ? (
        <AuthPage onNavigate={navigate} />
      ) : path === "/cart" ? (
        <CartPage onNavigate={navigate} />
      ) : path === "/checkout" ? (
        <CheckoutPage onNavigate={navigate} />
      ) : productId ? (
        <ProductDetailPage productId={productId} onNavigate={navigate} />
      ) : path.startsWith("/custom") ? (
        <CustomPage onNavigate={navigate} />
      ) : categoryMatch ? (
        <ShopPage onNavigate={navigate} categoryId={categoryMatch[1]} />
      ) : (
        <ShopPage onNavigate={navigate} />
      )}
      <Footer onNavigate={navigate} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
