import { useEffect, useState } from "react";
import { LogOut, Mail, Loader2, Package, ChevronRight, XCircle, X, Truck, Search, AlertCircle, Building2, Copy, Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { cancelOrderWithRefund, cancelCardOrder } from "@/lib/api";
import { BRAND } from "@/config/brand";
import { formatWon } from "@/lib/pricing";
import type { OrderRow, BankAccount } from "@/types/database";

interface AccountPageProps {
  onNavigate: (to: string) => void;
}

const BANK_LIST = [
  "국민은행", "신한은행", "우리은행", "하나은행", "농협은행", "기업은행",
  "SC제일은행", "씨티은행", "대구은행", "부산은행", "광주은행", "전북은행",
  "경남은행", "제주은행", "새마을금고", "신협", "우체국", "수협", "케이뱅크", "토스뱅크",
];

export function AccountPage({ onNavigate }: AccountPageProps) {
  const { session, loading: authLoading, signOut } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderRow | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    fetchSettings().then((settings) => {
      if (settings.bank_accounts) setBankAccounts(settings.bank_accounts);
    });
  }, []);

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

  const updateOrderInState = (id: string, updates: Partial<OrderRow>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    setSelectedOrder((prev) => (prev && prev.id === id ? { ...prev, ...updates } : prev));
  };

  const handleCancelBankTransfer = async (
    id: string,
    refundBank: string,
    refundAccountNumber: string,
    refundAccountHolder: string
  ) => {
    setCancellingId(id);
    try {
      await cancelOrderWithRefund(id, refundBank, refundAccountNumber, refundAccountHolder);
      updateOrderInState(id, {
        status: "cancelled",
        refund_bank: refundBank,
        refund_account_number: refundAccountNumber,
        refund_account_holder: refundAccountHolder,
      });
      setCancellingOrder(null);
    } catch {
      alert("주문 취소에 실패했습니다. 이미 제작이 시작되었을 수 있습니다.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelCard = async (id: string) => {
    setCancellingId(id);
    try {
      await cancelCardOrder(id, "고객 주문 취소 요청");
      updateOrderInState(id, { status: "cancelled", card_cancel_reason: "고객 주문 취소 요청" });
      setCancellingOrder(null);
    } catch {
      alert("주문 취소에 실패했습니다. 이미 제작이 시작되었을 수 있습니다.");
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory pt-20">
        <Loader2 size={28} className="animate-spin text-birch-400" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory pt-20">
        <RedirectToAuth onNavigate={onNavigate} />
      </main>
    );
  }

  const statusLabels: Record<string, string> = {
    payment_pending: "결제 대기",
    paid: "결제 완료",
    in_production: "제작 중",
    shipped: "배송 중",
    completed: "완료",
    cancelled: "취소",
  };

  const statusColors: Record<string, string> = {
    payment_pending: "bg-amber-100 text-amber-700",
    paid: "bg-teal-100 text-teal-700",
    in_production: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const cancellableStatuses = ["payment_pending", "paid"];

  const handleCancelClick = (e: React.MouseEvent, order: OrderRow) => {
    e.stopPropagation();
    setCancellingOrder(order);
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
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-charcoal">주문 내역</p>
              <button
                onClick={() => onNavigate("/guest-order")}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-birch-500 transition-colors hover:text-birch-600"
              >
                <Search size={13} />
                주문번호로 조회
              </button>
            </div>
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
                {orders.map((order) => {
                  const canCancel = cancellableStatuses.includes(order.status);
                  return (
                    <div
                      key={order.id}
                      className="cursor-pointer rounded-xl border border-birch-100 bg-birch-50/50 px-4 py-3 transition-colors hover:border-birch-300 hover:bg-birch-50"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-charcoal">
                            {order.product_name ?? "상품명 없음"}
                          </p>
                          <p className="mt-0.5 text-xs text-charcoal-muted">
                            {order.order_number && <span className="font-mono">{order.order_number} · </span>}
                            {new Date(order.created_at).toLocaleDateString("ko-KR")}
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-charcoal">{formatWon(order.total_price)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[order.status] ?? "bg-birch-100 text-charcoal"
                          }`}>
                            {statusLabels[order.status] ?? order.status}
                          </span>
                          {canCancel ? (
                            <button
                              onClick={(e) => handleCancelClick(e, order)}
                              disabled={cancellingId === order.id}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                            >
                              {cancellingId === order.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <XCircle size={12} />
                              )}
                              취소
                            </button>
                          ) : (
                            <ChevronRight size={16} className="text-charcoal-muted" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          bankAccounts={bankAccounts}
          onClose={() => setSelectedOrder(null)}
          onCancelClick={(o) => { setSelectedOrder(null); setCancellingOrder(o); }}
          cancelling={cancellingId === selectedOrder.id}
          canCancel={cancellableStatuses.includes(selectedOrder.status)}
          statusLabels={statusLabels}
          statusColors={statusColors}
        />
      )}

      {cancellingOrder && (
        <CancelModal
          order={cancellingOrder}
          cancelling={cancellingId === cancellingOrder.id}
          onClose={() => setCancellingOrder(null)}
          onCancelBankTransfer={handleCancelBankTransfer}
          onCancelCard={handleCancelCard}
        />
      )}
    </main>
  );
}

function CancelModal({
  order,
  cancelling,
  onClose,
  onCancelBankTransfer,
  onCancelCard,
}: {
  order: OrderRow;
  cancelling: boolean;
  onClose: () => void;
  onCancelBankTransfer: (id: string, bank: string, number: string, holder: string) => void;
  onCancelCard: (id: string) => void;
}) {
  const isCard = order.payment_method === "card";
  const [refundBank, setRefundBank] = useState("");
  const [refundAccountNumber, setRefundAccountNumber] = useState("");
  const [refundAccountHolder, setRefundAccountHolder] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (isCard) {
      onCancelCard(order.id);
      return;
    }
    if (!refundBank || !refundAccountNumber.trim() || !refundAccountHolder.trim()) {
      setError("은행, 계좌번호, 예금주를 모두 입력해주세요.");
      return;
    }
    setError(null);
    onCancelBankTransfer(order.id, refundBank, refundAccountNumber.trim(), refundAccountHolder.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-500" />
            <h2 className="font-serif text-lg text-charcoal">주문 취소</h2>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal-muted transition-colors hover:bg-birch-100"
          >
            <X size={20} />
          </button>
        </div>

        {order.order_number && (
          <p className="mt-2 font-mono text-sm text-charcoal-muted">{order.order_number}</p>
        )}

        <div className="mt-4 rounded-xl bg-birch-50 px-4 py-3 text-sm text-charcoal">
          <p>상품: {order.product_name ?? "-"}</p>
          <p className="mt-1">결제 방법: {isCard ? "카드 결제" : "무통장입금"}</p>
          <p className="mt-1">결제 금액: {formatWon(order.total_price)}</p>
        </div>

        {isCard ? (
          <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-800">
            카드 결제 주문을 취소하면 결제가 자동으로 취소됩니다.
            <br />
            취소 처리까지 영업일 기준 1~3일이 소요될 수 있습니다.
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-charcoal-muted">
              환불받으실 계좌 정보를 입력해주세요. 확인 후 입금해드립니다.
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-charcoal-muted">환불 은행</label>
                <select
                  value={refundBank}
                  onChange={(e) => setRefundBank(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-birch-200 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-birch-400 focus:outline-none focus:ring-2 focus:ring-birch-200"
                >
                  <option value="">은행 선택</option>
                  {BANK_LIST.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal-muted">계좌번호</label>
                <input
                  type="text"
                  value={refundAccountNumber}
                  onChange={(e) => setRefundAccountNumber(e.target.value)}
                  placeholder="'-' 없이 숫자만 입력"
                  className="mt-1 w-full rounded-xl border border-birch-200 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-birch-400 focus:outline-none focus:ring-2 focus:ring-birch-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-charcoal-muted">예금주</label>
                <input
                  type="text"
                  value={refundAccountHolder}
                  onChange={(e) => setRefundAccountHolder(e.target.value)}
                  placeholder="예금주명"
                  className="mt-1 w-full rounded-xl border border-birch-200 bg-white px-4 py-2.5 text-sm text-charcoal focus:border-birch-400 focus:outline-none focus:ring-2 focus:ring-birch-200"
                />
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">취소</button>
          <button
            onClick={handleSubmit}
            disabled={cancelling}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-red-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
          >
            {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            {isCard ? "결제 취소하기" : "주문 취소하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({
  order,
  bankAccounts,
  onClose,
  onCancelClick,
  cancelling,
  canCancel,
  statusLabels,
  statusColors,
}: {
  order: OrderRow;
  bankAccounts: BankAccount[];
  onClose: () => void;
  onCancelClick: (order: OrderRow) => void;
  cancelling: boolean;
  canCancel: boolean;
  statusLabels: Record<string, string>;
  statusColors: Record<string, string>;
}) {
  const created = new Date(order.created_at);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const validBankAccounts = bankAccounts.filter((a) => a.bank.trim() && a.accountNumber.trim() && a.accountHolder.trim());
  const showBankAccounts = order.payment_method === "bank_transfer" && order.status === "payment_pending" && validBankAccounts.length > 0;

  const handleCopyAccount = (acc: BankAccount, idx: number) => {
    const text = `${acc.bank} ${acc.accountNumber} ${acc.accountHolder}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-serif text-xl text-charcoal">주문 상세</h2>
            {order.order_number && (
              <p className="mt-1 font-mono text-sm text-charcoal-muted">{order.order_number}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-charcoal-muted transition-colors hover:bg-birch-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            statusColors[order.status] ?? "bg-birch-100 text-charcoal"
          }`}>
            {statusLabels[order.status] ?? order.status}
          </span>
          <span className="ml-2 rounded-full bg-birch-50 px-2.5 py-1 text-xs text-charcoal-muted">
            {order.payment_method === "card" ? "카드 결제" : order.payment_method === "bank_transfer" ? "무통장입금" : "-"}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-birch-200 bg-birch-50/50 p-4">
          <h3 className="text-xs font-semibold text-charcoal-muted">주문 상품</h3>
          <div className="mt-3 space-y-2 text-sm">
            <DetailRow label="상품명" value={order.product_name ?? "-"} />
            <DetailRow label="사이즈" value={`${order.width} × ${order.depth} × ${order.height}mm`} />
            {(order.selected_options ?? []).map((s, i) => (
              <DetailRow
                key={i}
                label={s.optionName}
                value={s.price > 0 ? `${s.valueLabel} (+${formatWon(s.price)})` : s.valueLabel}
              />
            ))}
            <div className="flex justify-between border-t border-birch-200 pt-2">
              <span className="text-charcoal-muted">총 금액</span>
              <span className="font-bold text-charcoal">{formatWon(order.total_price)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-birch-200 bg-white p-4">
          <h3 className="text-xs font-semibold text-charcoal-muted">배송 정보</h3>
          <div className="mt-3 space-y-2 text-sm">
            <DetailRow label="주문자" value={order.customer_name} />
            <DetailRow label="연락처" value={order.customer_phone} />
            <DetailRow label="이메일" value={order.customer_email || "-"} />
            <DetailRow label="주소" value={`${order.customer_postcode ?? ""} ${order.customer_address} ${order.customer_detail_address ?? ""}`.trim()} />
          </div>
        </div>

        {order.shipping_company && (
          <div className="mt-4 rounded-2xl border border-birch-200 bg-white p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-muted">
              <Truck size={14} />
              배송 정보
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <DetailRow label="택배사" value={order.shipping_company} />
              <DetailRow label="송장번호" value={order.tracking_number ?? "-"} />
              {order.shipped_at && (
                <DetailRow label="배송 시작" value={new Date(order.shipped_at).toLocaleDateString("ko-KR")} />
              )}
            </div>
          </div>
        )}

        {showBankAccounts && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <Building2 size={16} className="text-amber-700" />
              <h3 className="text-xs font-semibold text-amber-800">입금 계좌 안내</h3>
            </div>
            <p className="mt-2 text-xs text-amber-700">아래 계좌로 입금해주시면 확인 후 제작을 시작합니다. 입금자명은 주문자명과 동일하게 해주세요.</p>
            <div className="mt-3 space-y-3">
              {validBankAccounts.map((acc, idx) => (
                <div key={acc.id} className="rounded-xl border border-amber-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-charcoal">{acc.bank}</p>
                      <p className="mt-1 font-mono text-base text-charcoal">{acc.accountNumber}</p>
                      <p className="mt-0.5 text-xs text-charcoal-muted">예금주: {acc.accountHolder}</p>
                    </div>
                    <button
                      onClick={() => handleCopyAccount(acc, idx)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-birch-200 bg-white px-3 py-2 text-xs font-medium text-charcoal transition-colors hover:bg-birch-100"
                    >
                      {copiedIdx === idx ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      {copiedIdx === idx ? "복사됨" : "계좌 복사"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.status === "cancelled" && order.refund_bank && (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-xs font-semibold text-amber-800">환불 계좌 정보</h3>
            <div className="mt-3 space-y-2 text-sm">
              <DetailRow label="은행" value={order.refund_bank} />
              <DetailRow label="계좌번호" value={order.refund_account_number ?? "-"} />
              <DetailRow label="예금주" value={order.refund_account_holder ?? "-"} />
            </div>
          </div>
        )}

        {order.status === "cancelled" && order.card_cancel_reason && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-xs font-semibold text-blue-800">카드 결제 취소</h3>
            <p className="mt-2 text-sm text-blue-700">취소 사유: {order.card_cancel_reason}</p>
          </div>
        )}

        {order.memo && (
          <div className="mt-4 rounded-2xl border border-birch-200 bg-white p-4">
            <h3 className="text-xs font-semibold text-charcoal-muted">주문 메모</h3>
            <p className="mt-2 text-sm whitespace-pre-wrap text-charcoal">{order.memo}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-charcoal-muted">
          주문 일시: {created.toLocaleDateString("ko-KR")} {created.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="btn-outline flex-1">닫기</button>
          {canCancel && (
            <button
              onClick={() => onCancelClick(order)}
              disabled={cancelling}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-red-300 bg-white px-6 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-50"
            >
              {cancelling ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
              주문 취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="shrink-0 text-charcoal-muted">{label}</span>
      <span className="text-right font-medium text-charcoal">{value}</span>
    </div>
  );
}

function RedirectToAuth({ onNavigate }: { onNavigate: (to: string) => void }) {
  useEffect(() => {
    onNavigate("/auth");
  }, [onNavigate]);
  return <Loader2 size={28} className="animate-spin text-birch-400" />;
}
