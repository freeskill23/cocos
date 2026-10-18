import { useCallback, useEffect, useState } from "react";
import { Users, Loader2, KeyRound, Eye, X, Mail, Calendar, ShoppingBag, ShoppingCart, ChevronRight, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatWon } from "@/lib/pricing";
import type { OrderRow } from "@/types/database";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
}

interface UserDetail {
  orders: OrderRow[];
  cartItems: CartItemDetail[];
}

interface CartItemDetail {
  id: string;
  product_name: string;
  width: number;
  depth: number;
  height: number;
  unit_price: number;
  quantity: number;
  created_at: string;
}

function formatDate(value: string | null): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
}

export function MembersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resetModal, setResetModal] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("admin-users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (fnError) throw fnError;
      const path = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/list`;
      const res = await fetch(path, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabase.auth.session()?.access_token ?? ""}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("회원 목록을 불러오지 못했습니다.");
      const json = await res.json();
      setUsers(json.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const loadDetail = useCallback(async (user: AdminUser) => {
    setSelectedUser(user);
    setDetail(null);
    setDetailLoading(true);
    try {
      const path = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/${user.id}/detail`;
      const res = await fetch(path, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabase.auth.session()?.access_token ?? ""}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("회원 상세 정보를 불러오지 못했습니다.");
      const json = await res.json();
      setDetail({ orders: json.orders ?? [], cartItems: json.cartItems ?? [] });
    } catch {
      setDetail({ orders: [], cartItems: [] });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleResetPassword = async () => {
    if (!resetModal || newPassword.length < 6) return;
    setResetting(true);
    setResetResult(null);
    try {
      const path = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users/${resetModal.id}/reset-password`;
      const res = await fetch(path, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabase.auth.session()?.access_token ?? ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error ?? "비밀번호 변경에 실패했습니다.");
      }
      setResetResult("비밀번호가 변경되었습니다.");
      setTimeout(() => {
        setResetModal(null);
        setNewPassword("");
        setResetResult(null);
      }, 1500);
    } catch (err) {
      setResetResult(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.");
    } finally {
      setResetting(false);
    }
  };

  const filteredUsers = (users ?? []).filter((u) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return u.email.toLowerCase().includes(term);
  });

  return (
    <div>
      <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">회원 관리</h1>
      <p className="mt-2 text-sm text-charcoal-muted">가입된 회원 정보를 확인하고 비밀번호를 변경할 수 있습니다.</p>

      {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="mt-16 flex justify-center"><Loader2 size={28} className="animate-spin text-birch-400" /></div>
      ) : (
        <>
          <div className="mt-6 relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이메일 검색" className="input-field pl-9 text-sm" />
          </div>

          <div className="mt-4 rounded-3xl border border-birch-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-birch-500" />
              <h2 className="text-base font-semibold text-charcoal">회원 목록</h2>
              <span className="ml-auto text-xs text-charcoal-muted">{filteredUsers.length}명</span>
            </div>

            {filteredUsers.length === 0 ? (
              <p className="py-10 text-center text-sm text-charcoal-muted">등록된 회원이 없습니다.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-birch-200 text-charcoal-muted">
                      <th className="pb-3 font-medium">이메일</th>
                      <th className="pb-3 font-medium">가입일</th>
                      <th className="pb-3 font-medium">최근 로그인</th>
                      <th className="pb-3 font-medium text-right">관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-birch-100 last:border-0">
                        <td className="py-3 font-medium text-charcoal">{user.email}</td>
                        <td className="py-3 text-charcoal-muted">{formatDate(user.created_at)}</td>
                        <td className="py-3 text-charcoal-muted">{formatDate(user.last_sign_in_at)}</td>
                        <td className="py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => loadDetail(user)} className="inline-flex items-center gap-1 rounded-lg bg-birch-50 px-2.5 py-1.5 text-[11px] font-medium text-charcoal transition-colors hover:bg-birch-100">
                              <Eye size={12} /> 상세
                            </button>
                            <button onClick={() => { setResetModal(user); setNewPassword(""); setResetResult(null); }} className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 transition-colors hover:bg-amber-100">
                              <KeyRound size={12} /> 비밀번호
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* User detail drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelectedUser(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl text-charcoal">회원 상세</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-charcoal-muted"><Mail size={13} /> {selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-charcoal-muted hover:text-charcoal"><X size={20} /></button>
            </div>

            <div className="mt-4 flex gap-4 text-xs text-charcoal-muted">
              <span className="flex items-center gap-1"><Calendar size={13} /> 가입: {formatDate(selectedUser.created_at)}</span>
              <span className="flex items-center gap-1"><Calendar size={13} /> 최근 로그인: {formatDate(selectedUser.last_sign_in_at)}</span>
            </div>

            {detailLoading ? (
              <div className="mt-10 flex justify-center"><Loader2 size={24} className="animate-spin text-birch-400" /></div>
            ) : detail ? (
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={16} className="text-birch-500" />
                    <h3 className="text-sm font-semibold text-charcoal">주문 내역</h3>
                    <span className="ml-auto text-xs text-charcoal-muted">{detail.orders.length}건</span>
                  </div>
                  {detail.orders.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-birch-50 px-4 py-3 text-xs text-charcoal-muted">주문 내역이 없습니다.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {detail.orders.map((order) => (
                        <div key={order.id} className="rounded-xl border border-birch-200 bg-white p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-charcoal">{order.order_number ?? "-"}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${order.status === "paid" ? "bg-teal-50 text-teal-700" : order.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-birch-50 text-charcoal-muted"}`}>{order.status}</span>
                          </div>
                          <div className="mt-1.5 flex items-center justify-between text-xs text-charcoal-muted">
                            <span>{order.product_name ?? "-"} · {order.width}×{order.depth}×{order.height}mm</span>
                            <span className="font-medium text-charcoal">{formatWon(order.total_price)}</span>
                          </div>
                          <p className="mt-1 text-[10px] text-charcoal-muted">{formatDate(order.created_at)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-birch-500" />
                    <h3 className="text-sm font-semibold text-charcoal">장바구니</h3>
                    <span className="ml-auto text-xs text-charcoal-muted">{detail.cartItems.length}개</span>
                  </div>
                  {detail.cartItems.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-birch-50 px-4 py-3 text-xs text-charcoal-muted">장바구니에 담긴 상품이 없습니다.</p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {detail.cartItems.map((item) => (
                        <div key={item.id} className="rounded-xl border border-birch-200 bg-white p-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-charcoal">{item.product_name}</span>
                            <span className="text-charcoal-muted">×{item.quantity}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-charcoal-muted">
                            <span>{item.width}×{item.depth}×{item.height}mm</span>
                            <span className="font-medium text-charcoal">{formatWon(item.unit_price * item.quantity)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setResetModal(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-charcoal">비밀번호 변경</h2>
              <button onClick={() => setResetModal(null)} className="text-charcoal-muted hover:text-charcoal"><X size={20} /></button>
            </div>
            <p className="mt-2 text-xs text-charcoal-muted">{resetModal.email} 회원의 비밀번호를 새로 설정합니다.</p>
            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-charcoal">새 비밀번호</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" placeholder="6자 이상 입력" autoFocus />
            </div>
            {resetResult && <div className="mt-3 rounded-xl bg-birch-50 px-4 py-3 text-xs text-charcoal">{resetResult}</div>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setResetModal(null)} className="btn-outline flex-1 text-sm">취소</button>
              <button onClick={handleResetPassword} disabled={resetting || newPassword.length < 6} className="btn-primary flex-1 text-sm">
                {resetting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
