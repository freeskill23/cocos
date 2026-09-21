import { useState } from "react";
import { Check, PartyPopper, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { StepHeader, Field } from "@/components/custom/Step1DogInfo";
import { calculatePrice, formatWon, type HouseDimensions } from "@/lib/pricing";
import { type DesignId } from "@/config/designs";
import { type OptionChoice } from "@/config/options";
import { BRAND } from "@/config/brand";
import { insertOrder } from "@/lib/api";
import type { DogInfo } from "@/components/custom/Step1DogInfo";

interface Step6Props {
  dimensions: HouseDimensions;
  designId: DesignId;
  options: OptionChoice;
  dogInfo: DogInfo;
  onBack: () => void;
  onRestart: () => void;
  onHome: () => void;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  detailAddress: string;
}

export function Step6Order({
  dimensions,
  designId,
  options,
  dogInfo,
  onBack,
  onRestart,
  onHome,
}: Step6Props) {
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    address: "",
    detailAddress: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const breakdown = calculatePrice({ dimensions, designId, options });

  const update = (key: keyof CustomerInfo, value: string) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const isValid =
    customer.name.trim() && customer.phone.trim() && customer.address.trim();

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await insertOrder({
        dog_name: dogInfo.name || null,
        breed: dogInfo.breed || null,
        weight: dogInfo.weight || null,
        body_length: dogInfo.bodyLength || null,
        memo: dogInfo.memo || null,
        width: dimensions.width,
        depth: dimensions.depth,
        height: dimensions.height,
        design_id: designId,
        door_position: options.doorPosition,
        door_size_mode: options.doorSizeMode,
        door_custom_width: options.doorCustomWidth,
        door_custom_height: options.doorCustomHeight,
        engraving: options.engraving,
        engraving_text: options.engravingText,
        floor_type: options.floor,
        cushion: options.cushion,
        top_type: options.top,
        total_price: breakdown.total,
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email.trim() || null,
        customer_address: customer.address.trim(),
        customer_detail_address: customer.detailAddress.trim() || null,
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
        <h2 className="mt-8 font-serif text-3xl text-charcoal sm:text-4xl">주문제작 신청 완료</h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-charcoal-muted">
          {customer.name}님, 주문해주셔서 감사합니다.
          <br />
          입력하신 정보를 확인 후 1영업일 이내에 연락드리겠습니다.
        </p>

        <div className="mt-10 w-full max-w-md rounded-3xl border border-birch-200 bg-white p-6 text-left">
          <h3 className="text-sm font-semibold text-charcoal">주문 요약</h3>
          <div className="mt-4 space-y-2 text-sm">
            <SummaryRow label="반려견" value={dogInfo.name ? `${dogInfo.name} (${dogInfo.breed || "-"})` : "-"} />
            <SummaryRow label="사이즈" value={`${dimensions.width} × ${dimensions.depth} × ${dimensions.height}mm`} />
            <SummaryRow label="총 견적" value={formatWon(breakdown.total)} />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={onHome} className="btn-primary">
            홈으로
          </button>
          <button onClick={onRestart} className="btn-outline">
            새 주문 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepHeader title="주문" desc="배송받으실 정보를 입력하고 주문제작을 신청하세요." />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
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
          <Field label="이메일" optional>
            <input
              type="email"
              value={customer.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@example.com"
              className="input-field"
            />
          </Field>
          <Field label="배송 주소">
            <input
              type="text"
              value={customer.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="주소를 입력해주세요."
              className="input-field"
            />
          </Field>
          <Field label="상세 주소" optional>
            <input
              type="text"
              value={customer.detailAddress}
              onChange={(e) => update("detailAddress", e.target.value)}
              placeholder="상세 주소를 입력해주세요."
              className="input-field"
            />
          </Field>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-3xl border border-birch-200 bg-birch-50 p-6">
            <h3 className="text-sm font-semibold text-charcoal">주문 요약</h3>
            <div className="mt-4 space-y-2 text-sm">
              <SummaryRow label="반려견" value={dogInfo.name || "-"} />
              <SummaryRow label="사이즈" value={`${dimensions.width} × ${dimensions.depth} × ${dimensions.height}mm`} />
            </div>
            <div className="mt-4 border-t border-birch-200 pt-4">
              <div className="flex items-end justify-between">
                <span className="text-sm text-charcoal-muted">총 견적</span>
                <span className="font-serif text-2xl font-bold text-charcoal">{formatWon(breakdown.total)}</span>
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
              주문제작 신청하기
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-charcoal-muted">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  );
}
