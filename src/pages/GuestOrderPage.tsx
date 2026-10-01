import { useState } from "react";
import { Search, Loader2, Package, XCircle, ArrowLeft, X, AlertCircle } from "lucide-react";
import { fetchOrderByNumber, cancelOrderWithRefund, cancelCardOrder } from "@/lib/api";
import { formatWon } from "@/lib/pricing";
import { BRAND } from "@/config/brand";
import type { OrderRow } from "@/types/database";

interface GuestOrderPageProps {
  onNavigate: (to: string) => void;
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

const BANK_LIST = [
  "국민은행", "신한은행", "우리은행", "하나은행", "농협은행", "기업은행",
  "SC제일은행", "씨티은행", "대구은행", "부산은행", "광주은행", "전북은행",
  "경남은행", "제주은행", "새마을금고", "신협", "우체국", "수협", "케이뱅크", "토스뱅크",
];

export function GuestOrderPage({ onNavigate }: GuestOrderPageProps) {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    setSearching(true);
    setError(null);
    setOrder(null);
    try {
      const result = await fetchOrderByNumber(orderNumber.trim());
      if (!result) {
        setError("해당 주문번호를 찾을 수 없습니다. 주문번호를 확인해주세요.");
      } else {
        setOrder(result);
      }
    } catch {
      setError("주문 조회 중 오류가 발생했습니다.");
    } finally {
      setSearching(false);
    }
  };

  const handleCancelBankTransfer = async (refundBank: string, refundAccountNumber: string, refundAccountHolder: string) => {
    if (!order) return;
    setCancelling(true);
    try {
      await cancelOrderWithRefund(order.id, refundBank, refundAccountNumber, refundAccountHolder);
      setOrder({ ...order, status: "cancelled", refund_bank: refundBank, refund_account_number: refundAccountNumber, refund_account_holder: refundAccountHolder });
      setShowCancelModal(false);
    } catch {
      alert("주문 취소에 실패했습니다. 이미 제작이 시작되었을 수 있습니다.");
    } finally {
      setCancelling(false);
    }
  };

  const handleCancelCard = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      await cancelCardOrder(order.id, "고객 주문 취소 요청");
      setOrder({ ...order, status: "cancelled", card_cancel_reason: "고객 주문 취소 요청" });
      setShowCancelModal(false);
    } catch {
      alert("주문 취소에 실패했습니다. 이미 제작이 시작되었을 수 있습니다.");
    } finally {
      setCancelling(false);
    }
  };

  const cancellableStatuses = ["payment_pending", "paid"];
  const canCancel = order && cancellableStatuses.includes(order.status);

  return (
    <main className="min-h-screen bg-ivory pt-20 md:pt-24">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 md:py-16">
        <button
          onClick={() => onNavigate("/")}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-muted transition-colors hover:text-charcoal"
        >
          <ArrowLeft size={16} />
          홈으로
        </button>

        <p className="text-xs font-semibold tracking-[0.25em] text-charcoal-muted">{BRAND.nameEn}</p>
        <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">비회원 주문 조회</h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal-muted">
          주문 시 발급받은 주문번호를 입력하면 주문 내역을 확인하고 취소할 수 있습니다.
        </p>

        <div className="mt-8 rounded-3xl border border-birch-200 bg-white p-6 sm:p-8">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-muted" />
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="예: COCO-20260930-AB12"
                className="w-full rounded-xl border border-birch-200 bg-white py-3.5 pl-12 pr-4 text-sm font-mono text-charcoal focus:border-birch-400 focus:outline-none focus:ring-2 focus:ring-birch-200"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !orderNumber.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-charcoal px-6 py-3.5 text-sm font-medium text-ivory transition-all hover:bg-charcoal-light active:scale-[0.98] disabled:opacity-40"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              조회
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {order && (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-birch-200 bg-birch-50/50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm font-bold text-charcoal">{order.order_number}</p>
                    <p className="mt-1 text-xs text-charcoal-muted">
                      {new Date(order.created_at).toLocaleDateString("ko-KR")} {new Date(order.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[order.status] ?? "bg-birch-100 text-charcoal"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                    {order.payment_method && (
                      <span className="rounded-full bg-birch-50 px-2.5 py-0.5 text-[10px] text-charcoal-muted">
                        {order.payment_method === "card" ? "카드 결제" : "무통장입금"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-birch-200 bg-white p-5">
                <h3 className="text-xs font-semibold text-charcoal-muted">주문 상품</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">상품명</span>
                    <span className="font-medium text-charcoal">{order.product_name ?? "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">사이즈</span>
                    <span className="font-medium text-charcoal">{order.width} × {order.depth} × {order.height}mm</span>
                  </div>
                  {(order.selected_options ?? []).map((s, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-charcoal-muted">{s.optionName}</span>
                      <span className="font-medium text-charcoal">{s.valueLabel}{s.price > 0 ? ` (+${formatWon(s.price)})` : ""}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-birch-100 pt-2">
                    <span className="text-charcoal-muted">총 금액</span>
                    <span className="font-bold text-charcoal">{formatWon(order.total_price)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-birch-200 bg-white p-5">
                <h3 className="text-xs font-semibold text-charcoal-muted">배송 정보</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">주문자</span>
                    <span className="font-medium text-charcoal">{order.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">연락처</span>
                    <span className="font-medium text-charcoal">{order.customer_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-muted">주소</span>
                    <span className="font-medium text-charcoal text-right">{`${order.customer_postcode ?? ""} ${order.customer_address} ${order.customer_detail_address ?? ""}`.trim()}</span>
                  </div>
                </div>
              </div>

              {order.status === "cancelled" && order.refund_bank && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <h3 className="text-xs font-semibold text-amber-800">환불 계좌 정보</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-700">은행</span>
                      <span className="font-medium text-charcoal">{order.refund_bank}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">계좌번호</span>
                      <span className="font-medium text-charcoal">{order.refund_account_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-700">예금주</span>
                      <span className="font-medium text-charcoal">{order.refund_account_holder}</span>
                    </div>
                  </div>
                </div>
              )}

              {order.status === "cancelled" && order.card_cancel_reason && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <h3 className="text-xs font-semibold text-blue-800">카드 결제 취소</h3>
                  <p className="mt-2 text-sm text-blue-700">취소 사유: {order.card_cancel_reason}</p>
                </div>
              )}

              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelling}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-300 bg-white py-3.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-50"
                >
                  {cancelling ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  주문 취소하기
                </button>
              )}

              {order.status === "cancelled" && !order.refund_bank && !order.card_cancel_reason && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                  취소된 주문입니다.
                </div>
              )}
            </div>
          )}

          {!order && !error && !searching && (
            <div className="mt-6 flex flex-col items-center gap-2 py-8 text-center">
              <Package size={32} className="text-birch-300" />
              <p className="text-sm text-charcoal-muted">주문번호를 입력하고 조회 버튼을 눌러주세요.</p>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && order && (
        <CancelModal
          order={order}
          cancelling={cancelling}
          onClose={() => setShowCancelModal(false)}
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
  onCancelBankTransfer: (bank: string, number: string, holder: string) => void;
  onCancelCard: () => void;
}) {
  const isCard = order.payment_method === "card";
  const [refundBank, setRefundBank] = useState("");
  const [refundAccountNumber, setRefundAccountNumber] = useState("");
  const [refundAccountHolder, setRefundAccountHolder] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (isCard) {
      onCancelCard();
      return;
    }
    if (!refundBank || !refundAccountNumber.trim() || !refundAccountHolder.trim()) {
      setError("은행, 계좌번호, 예금주를 모두 입력해주세요.");
      return;
    }
    setError(null);
    onCancelBankTransfer(refundBank, refundAccountNumber.trim(), refundAccountHolder.trim());
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
