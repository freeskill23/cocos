import { useEffect, useState, useCallback } from "react";
import { Trash2, Eye, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { fetchAllOrders, updateOrderStatus, deleteOrder } from "@/lib/api";
import type { OrderRow } from "@/types/database";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, type OrderStatus } from "@/lib/supabase";
import { formatWon } from "@/lib/pricing";
import { DESIGNS } from "@/config/designs";

interface OrdersTabProps {
  onCountChange: (n: number) => void;
}

export function OrdersTab({ onCountChange }: OrdersTabProps) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllOrders();
      setOrders(data);
      onCountChange(data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "주문 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 주문을 삭제하시겠습니까?")) return;
    try {
      await deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제에 실패했습니다.");
    }
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">주문 관리</h1>
          <p className="mt-2 text-sm text-charcoal-muted">접수된 주문제작 신청 목록입니다.</p>
        </div>
        <button onClick={load} className="btn-ghost text-sm">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          새로고침
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          전체 ({orders.length})
        </FilterButton>
        {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => {
          const count = orders.filter((o) => o.status === status).length;
          return (
            <FilterButton key={status} active={filter === status} onClick={() => setFilter(status)}>
              {ORDER_STATUS_LABELS[status]} ({count})
            </FilterButton>
          );
        })}
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 size={28} className="animate-spin text-birch-400" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="mt-16 text-center text-sm text-charcoal-muted">주문이 없습니다.</div>
      ) : (
        <div className="mt-6 space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
        active ? "bg-charcoal text-ivory" : "bg-white text-charcoal-muted border border-birch-200 hover:border-birch-400"
      }`}
    >
      {children}
    </button>
  );
}

function OrderCard({
  order,
  expanded,
  onToggle,
  onStatusChange,
  onDelete,
}: {
  order: OrderRow;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
}) {
  const design = DESIGNS.find((d) => d.id === order.design_id);
  const status = order.status as OrderStatus;
  const created = new Date(order.created_at);

  return (
    <div className="overflow-hidden rounded-2xl border border-birch-200 bg-white">
      <button onClick={onToggle} className="flex w-full items-center justify-between p-5 text-left">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-charcoal">{order.customer_name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${ORDER_STATUS_COLORS[status]}`}>
                {ORDER_STATUS_LABELS[status]}
              </span>
            </div>
            <p className="mt-1 text-xs text-charcoal-muted">
              {order.dog_name || "-"} · {order.width}×{order.depth}×{order.height}mm · {formatWon(order.total_price)}
            </p>
            <p className="mt-0.5 text-[10px] text-charcoal-muted">
              {created.toLocaleDateString("ko-KR")} {created.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-charcoal-muted" /> : <ChevronDown size={18} className="text-charcoal-muted" />}
      </button>

      {expanded && (
        <div className="border-t border-birch-200 p-5">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-xs font-semibold text-charcoal-muted">반려견 정보</h4>
              <div className="mt-2 space-y-1.5 text-sm">
                <DetailRow label="이름" value={order.dog_name || "-"} />
                <DetailRow label="견종" value={order.breed || "-"} />
                <DetailRow label="몸무게" value={order.weight || "-"} />
                <DetailRow label="몸길이" value={order.body_length ? `${order.body_length}cm` : "-"} />
                {order.memo && <DetailRow label="메모" value={order.memo} />}
              </div>

              <h4 className="mt-4 text-xs font-semibold text-charcoal-muted">제작 정보</h4>
              <div className="mt-2 space-y-1.5 text-sm">
                <DetailRow label="사이즈" value={`${order.width} × ${order.depth} × ${order.height}mm`} />
                <DetailRow label="디자인" value={design ? `${design.code} ${design.nameKr}` : order.design_id} />
                <DetailRow label="출입구" value={`${doorLabel(order.door_position)} / ${order.door_size_mode === "custom" ? "직접입력" : "추천"}`} />
                <DetailRow label="각인" value={order.engraving === "yes" ? `있음 (${order.engraving_text || "-"})` : "없음"} />
                <DetailRow label="바닥판" value={order.floor_type === "removable" ? "탈착식" : "기본"} />
                <DetailRow label="쿠션" value={order.cushion === "add" ? "추가" : "없음"} />
                <DetailRow label="상판" value={order.top_type === "storage" ? "수납형" : "기본"} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-charcoal-muted">고객 정보</h4>
              <div className="mt-2 space-y-1.5 text-sm">
                <DetailRow label="이름" value={order.customer_name} />
                <DetailRow label="연락처" value={order.customer_phone} />
                <DetailRow label="이메일" value={order.customer_email || "-"} />
                <DetailRow label="주소" value={`${order.customer_address} ${order.customer_detail_address || ""}`} />
              </div>

              <h4 className="mt-4 text-xs font-semibold text-charcoal-muted">결제</h4>
              <div className="mt-2 space-y-1.5 text-sm">
                <DetailRow label="총 견적" value={formatWon(order.total_price)} />
              </div>

              <div className="mt-5">
                <label className="text-xs font-semibold text-charcoal-muted">주문 상태 변경</label>
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                  className="mt-2 w-full rounded-xl border border-birch-200 bg-white px-4 py-2.5 text-sm font-medium text-charcoal focus:border-birch-400 focus:outline-none focus:ring-2 focus:ring-birch-200"
                >
                  {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => onDelete(order.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={14} />
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function doorLabel(p: string): string {
  if (p === "front") return "정면";
  if (p === "left") return "좌측";
  return "우측";
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="w-16 shrink-0 text-charcoal-muted">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  );
}
