import { useEffect, useState } from "react";
import { LogOut, Mail, Loader2, Package, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { BRAND } from "@/config/brand";
import type { OrderRow } from "@/types/database";

interface AccountPageProps {
  onNavigate: (to: string) => void;
}

export function AccountPage({ onNavigate }: AccountPageProps) {
  const { session, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false);
      return;
    }
    supabase
      .from("orders")
      .select("*")
      .eq("customer_email", session.user.email)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data ?? []);
        setLoading(false);
      });
  }, [session]);

  const handleLogout = async () => {
    await signOut();
    onNavigate("/");
  };

  if (!session) {
    onNavigate("/auth");
    return null;
  }

  const statusLabels: Record<string, string> = {
    received: "접수 완료",
    payment_pending: "입금 대기",
    in_review: "검토 중",
    in_production: "제작 중",
    shipped: "배송 중",
    completed: "완료",
    cancelled: "취소",
  };

  const statusColors: Record<string, string> = {
    received: "bg-birch-100 text-charcoal",
    payment_pending: "bg-amber-100 text-amber-700",
    in_review: "bg-amber-100 text-amber-700",
    in_production: "bg-blue-100 text-blue-700",
    shipped: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <main className="min-h-screen bg-ivory pt-20 md:pt-24">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 md:py-16">
        <p className="text-xs font-semibold tracking-[0.25em] text-charcoal-muted">{BRAND.nameEn}</p>
        <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">내 정보 관리</h1>

        <div className="mt-8 rounded-3xl border border-birch-200 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-birch-100">
              <Mail size={24} className="text-birch-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-charcoal-muted">로그인된 이메일</p>
              <p className="text-lg font-semibold text-charcoal">{session.user.email}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-birch-100 pt-6">
            <p className="text-xs font-semibold text-charcoal">주문 내역</p>
            {loading ? (
              <div className="mt-4 flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-birch-400" />
              </div>
            ) : orders.length === 0 ? (
              <div className="mt-4 flex flex-col items-center gap-2 py-8 text-center">
                <Package size={32} className="text-birch-300" />
                <p className="text-sm text-charcoal-muted">주문 내역이 없습니다.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-xl border border-birch-100 bg-birch-50/50 px-4 py-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">
                        {order.product_name ?? "상품명 없음"}
                      </p>
                      <p className="mt-0.5 text-xs text-charcoal-muted">
                        {new Date(order.created_at).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statusColors[order.status] ?? "bg-birch-100 text-charcoal"
                      }`}>
                        {statusLabels[order.status] ?? order.status}
                      </span>
                      <ChevronRight size={16} className="text-charcoal-muted" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-birch-100 pt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border-2 border-charcoal bg-white px-6 py-3 text-sm font-medium text-charcoal transition-all hover:bg-charcoal hover:text-ivory active:scale-[0.98]"
            >
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        </div>

        <button
          onClick={() => onNavigate("/")}
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-muted transition-colors hover:text-charcoal"
        >
          홈으로 돌아가기
        </button>
      </div>
    </main>
  );
}
