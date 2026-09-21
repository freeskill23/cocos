import { useEffect, useState } from "react";
import { Save, Loader2, AlertCircle, Check } from "lucide-react";
import { fetchSettings, upsertSetting } from "@/lib/api";
import type { SettingsMap } from "@/types/database";
import { PRICING_CONFIG } from "@/config/pricing";
import { SIZE_LIMITS } from "@/config/sizes";

interface PricingSettings {
  baseFee: number;
  areaRatePerSqmm: number;
  sizeScaleRate: number;
  packagingFee: number;
  shippingFee: number;
  freeShippingThreshold: number;
}

interface SizeSettings {
  minWidth: number;
  maxWidth: number;
  minDepth: number;
  maxDepth: number;
  minHeight: number;
  maxHeight: number;
}

export function SettingsTab() {
  const [pricing, setPricing] = useState<PricingSettings>({
    baseFee: PRICING_CONFIG.BASE_FEE,
    areaRatePerSqmm: PRICING_CONFIG.AREA_RATE_PER_SQMM,
    sizeScaleRate: PRICING_CONFIG.SIZE_SCALE_RATE,
    packagingFee: PRICING_CONFIG.PACKAGING_FEE,
    shippingFee: PRICING_CONFIG.SHIPPING_FEE,
    freeShippingThreshold: PRICING_CONFIG.FREE_SHIPPING_THRESHOLD,
  });
  const [sizes, setSizes] = useState<SizeSettings>({
    minWidth: SIZE_LIMITS.MIN_WIDTH,
    maxWidth: SIZE_LIMITS.MAX_WIDTH,
    minDepth: SIZE_LIMITS.MIN_DEPTH,
    maxDepth: SIZE_LIMITS.MAX_DEPTH,
    minHeight: SIZE_LIMITS.MIN_HEIGHT,
    maxHeight: SIZE_LIMITS.MAX_HEIGHT,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const settings = await fetchSettings();
        if (settings.pricing) setPricing((prev) => ({ ...prev, ...settings.pricing! }));
        if (settings.sizes) setSizes((prev) => ({ ...prev, ...settings.sizes! }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "설정을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await Promise.all([
        upsertSetting("pricing", pricing),
        upsertSetting("sizes", sizes),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-16 flex justify-center">
        <Loader2 size={28} className="animate-spin text-birch-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-charcoal sm:text-3xl">설정</h1>
          <p className="mt-2 text-sm text-charcoal-muted">가격 및 사이즈 범위를 관리합니다.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          저장
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {saved && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <Check size={16} />
          설정이 저장되었습니다.
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Pricing */}
        <div className="rounded-3xl border border-birch-200 bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">가격 설정</h2>
          <p className="mt-1 text-xs text-charcoal-muted">자동견적 계산에 사용되는 단가입니다.</p>
          <div className="mt-6 space-y-4">
            <NumberField label="기본 제작비 (원)" value={pricing.baseFee} onChange={(v) => setPricing({ ...pricing, baseFee: v })} />
            <NumberField label="면적당 단가 (원/mm²)" value={pricing.areaRatePerSqmm} step={0.01} onChange={(v) => setPricing({ ...pricing, areaRatePerSqmm: v })} />
            <NumberField label="사이즈 증가 비율" value={pricing.sizeScaleRate} step={0.001} onChange={(v) => setPricing({ ...pricing, sizeScaleRate: v })} />
            <NumberField label="포장비 (원)" value={pricing.packagingFee} onChange={(v) => setPricing({ ...pricing, packagingFee: v })} />
            <NumberField label="배송비 (원)" value={pricing.shippingFee} onChange={(v) => setPricing({ ...pricing, shippingFee: v })} />
            <NumberField label="무료배송 기준 (원)" value={pricing.freeShippingThreshold} onChange={(v) => setPricing({ ...pricing, freeShippingThreshold: v })} />
          </div>
        </div>

        {/* Sizes */}
        <div className="rounded-3xl border border-birch-200 bg-white p-6">
          <h2 className="text-base font-semibold text-charcoal">사이즈 범위</h2>
          <p className="mt-1 text-xs text-charcoal-muted">고객이 입력할 수 있는 최소/최대 사이즈입니다.</p>
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="가로 최소 (mm)" value={sizes.minWidth} onChange={(v) => setSizes({ ...sizes, minWidth: v })} />
              <NumberField label="가로 최대 (mm)" value={sizes.maxWidth} onChange={(v) => setSizes({ ...sizes, maxWidth: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="세로 최소 (mm)" value={sizes.minDepth} onChange={(v) => setSizes({ ...sizes, minDepth: v })} />
              <NumberField label="세로 최대 (mm)" value={sizes.maxDepth} onChange={(v) => setSizes({ ...sizes, maxDepth: v })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField label="높이 최소 (mm)" value={sizes.minHeight} onChange={(v) => setSizes({ ...sizes, minHeight: v })} />
              <NumberField label="높이 최대 (mm)" value={sizes.maxHeight} onChange={(v) => setSizes({ ...sizes, maxHeight: v })} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-birch-50 p-4 text-xs leading-relaxed text-charcoal-muted">
        저장된 설정은 데이터베이스에 보관됩니다. 변경된 가격은 새로운 주문부터 반영됩니다.
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-charcoal">{label}</label>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="input-field"
      />
    </div>
  );
}
