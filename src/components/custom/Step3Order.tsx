import { useState, useMemo } from "react";
import { Check, PartyPopper, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { StepHeader, Field } from "@/components/custom/Step1Product";
import { calculatePrice, formatWon } from "@/lib/pricing";
import { insertOrder } from "@/lib/api";
import { BRAND } from "@/config/brand";
import type { PricingSettings, SizeSettings } from "@/config/pricing";
import type { ProductRow, ProductOption, SelectedOption } from "@/types/database";

interface Step3Props {
  product: ProductRow;
  dimensions: { width: number; depth: number; height: number };
  pricing: PricingSettings;
  sizes: SizeSettings;
  onBack: () => void;
  onRestart: () => void;
  onHome: () => void;
}

interface CustomerInfo {
  name: string;
  phone: string;
  postcode: string;
  address: string;
  detailAddress: string;
  memo: string;
}

export function Step3Order({
  product,
  dimensions,
  pricing,
  sizes,
  onBack,
  onRestart,
  onHome,
}: Step3Props) {
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    postcode: "",
    address: "",
    detailAddress: "",
    memo: "",
  });
  const [selectedOptionValueIds, setSelectedOptionValueIds] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const breakdown = calculatePrice({ product, dimensions, pricing }, sizes);

  const selectedOptions: SelectedOption[] = useMemo(() => {
    return (product.options ?? [])
      .filter((opt) => selectedOptionValueIds[opt.id])
      .map((opt) => {
        const val = opt.values.find((v) => v.id === selectedOptionValueIds[opt.id]);
        return {
          optionName: opt.name,
          valueLabel: val?.label ?? "",
          price: val?.price ?? 0,
        };
      })
      .filter((s) => s.valueLabel);
  }, [product.options, selectedOptionValueIds]);

  const optionsTotal = useMemo(
    () => selectedOptions.reduce((sum, s) => sum + s.price, 0),
    [selectedOptions]
  );

  const grandTotal = breakdown.total + optionsTotal;

  const update = (key: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const handleOptionSelect = (optId: string, valId: string) => {
    setSelectedOptionValueIds((prev) => ({ ...prev, [optId]: valId }));
  };

  const isValid = customer.name.trim() && customer.phone.trim() && customer.address.trim();

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await insertOrder({
        product_id: product.id,
        product_name: product.name,
        width: dimensions.width,
        depth: dimensions.depth,
        height: dimensions.height,
        total_price: grandTotal,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: null,
        customer_postcode: customer.postcode.trim() || null,
        customer_address: customer.address.trim(),
        customer_detail_address: customer.detailAddress.trim() || null,
        selected_options: selectedOptions,
        memo: customer.memo.trim() || null,
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "주문 접수 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-birch-100">
          <PartyPopper size={36} className="text-birch-600" />
        </div>
        <h2 className="mt-8 font-serif text-3xl text-charcoal sm:text-4xl">주문 신청 완료</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal-muted">
          {customer.name}님, 주문해주셔서 감사합니다.
          <br />
          입력하신 정보를 확인 후 1영업일 이내에 연락드리겠습니다.
        </p>

        <div className="mt-10 w-full max-w-md rounded-3xl border border-birch-200 bg-white p-6 text-left">
          <h3 className="text-sm font-semibold text-charcoal">주문 요약</h3>
          <div className="mt-4 space-y-2 text-sm">
            <SummaryRow label="상품" value={product.name} />
            <SummaryRow label="사이즈" value={`${dimensions.width} × ${dimensions.depth} × ${dimensions.height}mm`} />
            {selectedOptions.map((s, i) => (
              <SummaryRow key={i} label={s.optionName} value={s.price > 0 ? `${s.valueLabel} (+${formatWon(s.price)})` : s.valueLabel} />
            ))}
            <SummaryRow label="총 견적" value={formatWon(grandTotal)} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={onHome} className="btn-primary">홈으로</button>
          <button onClick={onRestart} className="btn-outline">새 주문 만들기</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepHeader title="주문" desc="옵션을 선택하고 배송받으실 정보를 입력하세요." />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
          {(product.options ?? []).length > 0 && (
            <div className="rounded-2xl border border-birch-200 bg-birch-50 p-5">
              <h3 className="text-sm font-semibold text-charcoal">추가 옵션 선택</h3>
              <div className="mt-4 space-y-4">
                {(product.options ?? []).map((opt) => (
                  <OptionSelector
                    key={opt.id}
                    option={opt}
                    selectedValueId={selectedOptionValueIds[opt.id] ?? ""}
                    onSelect={(valId) => handleOptionSelect(opt.id, valId)}
                  />
                ))}
              </div>
            </div>
          )}

          <Field label="주문자 이름">
            <input
              type="text"
              value={customer.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="이름을 입력해주세요."
              className="input-field"
            />
          </Field>
          <Field label="연락처">
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="010-0000-0000"
              className="input-field"
            />
          </Field>
          <Field label="우편번호" optional>
            <input
              type="text"
              value={customer.postcode}
              onChange={(e) => update("postcode", e.target.value)}
              placeholder="예: 06236"
              className="input-field"
            />
          </Field>
          <Field label="배송 주소">
            <input
              type="text"
              value={customer.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="도로명 주소를 입력해주세요."
              className="input-field"
            />
          </Field>

          <Field label="상세 주소">
            <input
              id="detail-address-input"
              type="text"
              value={customer.detailAddress}
              onChange={(e) => update("detailAddress", e.target.value)}
              placeholder="동, 호수 등 상세 주소를 입력해주세요."
              className="input-field"
            />
          </Field>

          <Field label="메모" optional>
            <textarea
              value={customer.memo}
              onChange={(e) => update("memo", e.target.value)}
              placeholder="요청사항을 자유롭게 적어주세요."
              rows={3}
              className="input-field resize-none"
            />
          </Field>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-3xl border border-birch-200 bg-birch-50 p-6">
            <h3 className="text-sm font-semibold text-charcoal">주문 요약</h3>
            <div className="mt-4 space-y-2 text-sm">
              <SummaryRow label="상품" value={product.name} />
              <SummaryRow label="사이즈" value={`${dimensions.width} × ${dimensions.depth} × ${dimensions.height}mm`} />
            </div>
            <div className="mt-4 space-y-2 border-t border-birch-200 pt-4">
              <SummaryRow label="기본가격" value={formatWon(breakdown.basePrice)} />
              {breakdown.widthAdjust > 0 && <SummaryRow label="가로 추가" value={`+${formatWon(breakdown.widthAdjust)}`} />}
              {breakdown.depthAdjust > 0 && <SummaryRow label="세로 추가" value={`+${formatWon(breakdown.depthAdjust)}`} />}
              {breakdown.heightAdjust > 0 && <SummaryRow label="높이 추가" value={`+${formatWon(breakdown.heightAdjust)}`} />}
              <SummaryRow label="포장비" value={formatWon(breakdown.packagingFee)} />
              <SummaryRow label="배송비" value={breakdown.shippingFee === 0 ? "무료" : formatWon(breakdown.shippingFee)} />
              {selectedOptions.map((s, i) => (
                <SummaryRow key={i} label={s.optionName} value={s.price > 0 ? `+${formatWon(s.price)}` : s.valueLabel} />
              ))}
            </div>
            <div className="mt-4 border-t border-birch-200 pt-4">
              <div className="flex items-end justify-between">
                <span className="text-sm text-charcoal-muted">총 견적</span>
                <span className="font-serif text-2xl font-bold text-charcoal">{formatWon(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          {submitError}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-muted transition-colors hover:text-charcoal disabled:opacity-40"
        >
          ← 이전
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid || submitting}
          className="group inline-flex items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-4 text-base font-medium text-ivory transition-all hover:bg-charcoal-light active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-charcoal"
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              접수 중...
            </>
          ) : (
            <>
              <Check size={18} />
              주문 신청하기
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-charcoal-muted">
        {BRAND.nameKr}는 주문제작 상품으로, 제작 시작 후에는 취소가 어려울 수 있습니다.
      </p>
    </div>
  );
}

function OptionSelector({
  option,
  selectedValueId,
  onSelect,
}: {
  option: ProductOption;
  selectedValueId: string;
  onSelect: (valId: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-charcoal">{option.name}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {option.values.map((val) => {
          const isSelected = selectedValueId === val.id;
          return (
            <button
              key={val.id}
              type="button"
              onClick={() => onSelect(val.id)}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-2 text-sm transition-all ${
                isSelected
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-birch-200 bg-white text-charcoal hover:border-birch-400"
              }`}
            >
              <span className="font-medium">{val.label}</span>
              {val.price > 0 && (
                <span className={`text-xs ${isSelected ? "text-ivory/70" : "text-charcoal-muted"}`}>
                  +{formatWon(val.price)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-charcoal-muted">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  );
}
