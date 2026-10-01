import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, Globe2, Loader2, RefreshCw, Search, Users, MousePointerClick, ShoppingBag } from "lucide-react";
import { fetchAnalyticsVisits, type AnalyticsVisit } from "@/lib/analytics";

const DAY_OPTIONS = [7, 30, 90] as const;

type DayRange = (typeof DAY_OPTIONS)[number];

type CountRow = { label: string; count: number; conversions: number };

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function groupRows(rows: AnalyticsVisit[], getLabel: (row: AnalyticsVisit) => string): CountRow[] {
  const grouped = new Map<string, CountRow>();
  for (const row of rows) {
    const label = getLabel(row) || "직접 유입 / 미상";
    const current = grouped.get(label) ?? { label, count: 0, conversions: 0 };
    current.count += 1;
    if (row.event_type === "conversion") current.conversions += 1;
    grouped.set(label, current);
  }
  return [...grouped.values()].sort((a, b) => b.count - a.count).slice(0, 10);
}

export function AnalyticsTab() {
  const [days, setDays] = useState<DayRange>(30);
  const [rows, setRows] = useState<AnalyticsVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async (range: DayRange, isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    const until = new Date();
    const since = new Date(until.getTime() - range * 24 * 60 * 60 * 1000);
    try {
      setRows(await fetchAnalyticsVisits(since.toISOString(), until.toISOString()));
    } catch {
      setError("분석 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(days); }, [days, load]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => [row.ip_address, row.naver_keyword, row.utm_campaign, row.page_path, row.referrer].some((value) => value?.toLowerCase().includes(term)));
  }, [rows, search]);

  const stats = useMemo(() => ({
    visits: filteredRows.filter((row) => row.event_type === "visit").length,
    visitors: new Set(filteredRows.map((row) => row.visitor_id)).size,
    sessions: new Set(filteredRows.map((row) => row.session_id)).size,
    conversions: filteredRows.filter((row) => row.event_type === "conversion").length,
    revenue: filteredRows.reduce((sum, row) => sum + (row.conversion_value ?? 0), 0),
  }), [filteredRows]);

  const keywords = useMemo(() => groupRows(filteredRows, (row) => row.naver_keyword ?? row.utm_term ?? ""), [filteredRows]);
  const campaigns = useMemo(() => groupRows(filteredRows, (row) => row.utm_campaign ?? row.naver_campaign ?? ""), [filteredRows]);
  const ips = useMemo(() => groupRows(filteredRows, (row) => row.ip_address ?? "IP 확인 불가"), [filteredRows]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">로그 분석</h1>
            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">실시간 수집</span>
          </div>
          <p className="mt-2 text-sm text-charcoal-muted">네이버 광고 유입부터 반복 방문과 주문 전환까지 확인합니다.</p>
        </div>
        <button onClick={() => void load(days, true)} disabled={refreshing} className="btn-outline self-start text-sm">
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> 새로고침
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-birch-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-charcoal"><CalendarDays size={16} className="text-birch-500" /> 분석 기간</div>
        <div className="flex gap-2">
          {DAY_OPTIONS.map((option) => <button key={option} onClick={() => setDays(option)} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${days === option ? "bg-charcoal text-white" : "bg-birch-50 text-charcoal-muted hover:bg-birch-100"}`}>{option}일</button>)}
        </div>
      </div>

      {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? <div className="mt-16 flex justify-center"><Loader2 size={28} className="animate-spin text-birch-400" /></div> : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="페이지 방문" value={stats.visits} icon={MousePointerClick} />
            <Metric label="순 방문자" value={stats.visitors} icon={Users} />
            <Metric label="방문 세션" value={stats.sessions} icon={Globe2} />
            <Metric label="주문 전환" value={stats.conversions} icon={ShoppingBag} />
            <Metric label="전환 금액" value={`${formatNumber(stats.revenue)}원`} icon={BarChart3} />
          </div>

          <div className="mt-6 rounded-3xl border border-birch-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="text-base font-semibold text-charcoal">유입 키워드</h2><p className="mt-1 text-xs text-charcoal-muted">네이버 PowerLink의 n_keyword와 UTM term을 함께 집계합니다.</p></div>
              <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="IP, 키워드, 캠페인 검색" className="input-field w-full pl-9 text-xs sm:w-64" /></div>
            </div>
            <RankingTable rows={keywords} empty="아직 기록된 키워드가 없습니다." />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <RankingCard title="캠페인별 유입" rows={campaigns} />
            <RankingCard title="반복 방문 IP" rows={ips} showRepeat />
          </div>

          <div className="mt-6 rounded-3xl border border-birch-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold text-charcoal">최근 방문 기록</h2><p className="mt-1 text-xs text-charcoal-muted">원본 IP는 관리자에게만 표시됩니다.</p></div><span className="text-xs text-charcoal-muted">{formatNumber(filteredRows.length)}건</span></div>
            <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-birch-200 text-charcoal-muted"><th className="pb-3 font-medium">시간</th><th className="pb-3 font-medium">IP</th><th className="pb-3 font-medium">키워드</th><th className="pb-3 font-medium">캠페인</th><th className="pb-3 font-medium">페이지</th><th className="pb-3 font-medium">기기</th><th className="pb-3 font-medium">구분</th></tr></thead><tbody>{filteredRows.slice(0, 100).map((row) => <tr key={row.id} className="border-b border-birch-100 last:border-0"><td className="py-3 text-charcoal-muted">{formatDate(row.occurred_at)}</td><td className="py-3 font-mono text-charcoal">{row.ip_address ?? "-"}</td><td className="py-3 text-charcoal">{row.naver_keyword ?? row.utm_term ?? "직접 유입"}</td><td className="py-3 text-charcoal-muted">{row.utm_campaign ?? row.naver_campaign ?? "-"}</td><td className="py-3 text-charcoal-muted">{row.page_path}</td><td className="py-3 text-charcoal-muted">{row.device_type ?? "-"}</td><td className="py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${row.event_type === "conversion" ? "bg-teal-50 text-teal-700" : "bg-birch-50 text-charcoal-muted"}`}>{row.event_type === "conversion" ? "주문" : "방문"}</span></td></tr>)}</tbody></table>{filteredRows.length === 0 && <p className="py-10 text-center text-sm text-charcoal-muted">기록이 없습니다.</p>}</div>
          </div>
        </>
      )}
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof BarChart3 }) {
  return <div className="rounded-2xl border border-birch-200 bg-white p-5"><div className="flex items-center justify-between"><Icon size={19} className="text-birch-500" /><span className="font-serif text-2xl font-bold text-charcoal">{typeof value === "number" ? formatNumber(value) : value}</span></div><p className="mt-3 text-xs text-charcoal-muted">{label}</p></div>;
}

function RankingCard({ title, rows, showRepeat = false }: { title: string; rows: CountRow[]; showRepeat?: boolean }) {
  return <div className="rounded-3xl border border-birch-200 bg-white p-5 sm:p-6"><h2 className="text-base font-semibold text-charcoal">{title}</h2><RankingTable rows={rows} showRepeat={showRepeat} empty="데이터가 없습니다." /></div>;
}

function RankingTable({ rows, empty, showRepeat = false }: { rows: CountRow[]; empty: string; showRepeat?: boolean }) {
  if (rows.length === 0) return <p className="py-8 text-sm text-charcoal-muted">{empty}</p>;
  return <div className="mt-5 space-y-3">{rows.map((row, index) => <div key={row.label} className="flex items-center gap-3"><span className="w-5 text-xs font-semibold text-birch-500">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-4 text-xs"><span className="truncate font-medium text-charcoal">{row.label}</span><span className="shrink-0 text-charcoal-muted">{formatNumber(row.count)}회{row.conversions > 0 ? ` · 주문 ${row.conversions}` : showRepeat && row.count > 1 ? " · 반복 방문" : ""}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-birch-100"><div className="h-full rounded-full bg-birch-400" style={{ width: `${Math.max(8, (row.count / rows[0].count) * 100)}%` }} /></div></div></div>)}</div>;
}
