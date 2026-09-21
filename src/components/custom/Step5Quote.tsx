import { Check, Info } from "lucide-react";
import { WizardNav } from "@/components/WizardNav";
import { StepHeader } from "@/components/custom/Step1DogInfo";
import { DESIGNS, type DesignId } from "@/config/designs";
import { type OptionChoice, OPTION_PRICES } from "@/config/options";
import { calculatePrice, formatWon, type HouseDimensions, type PriceBreakdown } from "@/lib/pricing";

interface Step5Props {
  dimensions: HouseDimensions;
  designId: DesignId;
  options: OptionChoice;
  dogInfo: { name: string; breed: string; weight: string };
  onNext: () => void;
  onBack: () => void;
}

export function Step5Quote({
  dimensions,
  designId,
  options,
  dogInfo,
  onNext,
  onBack,
}: Step5Props) {
  const breakdown = calculatePrice({ dimensions, designId, options });
  const design = DESIGNS.find((d) => d.id === designId);

  return (
    <div>
      <StepHeader title="견적" desc="입력하신 정보를 바탕으로 계산된 최종 견적입니다." />

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Summary */}
        <div className="lg:col-span-2 space-y-4">
          <SummaryCard title="반려견">
            <SummaryRow label="이름" value={dogInfo.name || "-"} />
            <SummaryRow label="견종" value={dogInfo.breed || "-"} />
            <SummaryRow label="몸무게" value={dogInfo.weight ? `${dogInfo.weight}kg` : "-"} />
          </SummaryCard>

          <SummaryCard title="사이즈">
            <SummaryRow label="가로" value={`${dimensions.width}mm`} />
            <SummaryRow label="세로" value={`${dimensions.depth}mm`} />
            <SummaryRow label="높이" value={`${dimensions.height}mm`} />
          </SummaryCard>

          <SummaryCard title="디자인">
            <SummaryRow label="디자인" value={`${design?.code} ${design?.nameKr}`} />
          </SummaryCard>

          <SummaryCard title="옵션">
            <SummaryRow label="출입구 위치" value={doorPositionLabel(options.doorPosition)} />
            <SummaryRow label="출입구 크기" value={options.doorSizeMode === "custom" ? "직접 입력" : "추천 사이즈"} />
            <SummaryRow label="이름 각인" value={options.engraving === "yes" ? `있음 (${options.engravingText || "-"})` : "없음"} />
            <SummaryRow label="바닥판" value={options.floor === "removable" ? "탈착식" : "기본"} />
            <SummaryRow label="쿠션" value={options.cushion === "add" ? "추가" : "없음"} />
            <SummaryRow label="상판" value={options.top === "storage" ? "수납형" : "기본"} />
          </SummaryCard>
        </div>

        {/* Price breakdown */}
        <div className="lg:col-span-3">
          <div className="sticky top-24 overflow-hidden rounded-3xl border border-birch-200 bg-white">
            <div className="border-b border-birch-200 bg-birch-50 px-6 py-5">
              <h3 className="text-lg font-semibold text-charcoal">견적 내역</h3>
            </div>
            <div className="p-6">
              <BreakdownList breakdown={breakdown} />

              <div className="mt-6 flex items-start gap-2 rounded-xl bg-birch-50 p-4">
                <Info size={16} className="mt-0.5 shrink-0 text-charcoal-muted" />
                <p className="text-xs leading-relaxed text-charcoal-muted">
                  본 견적은 참고용이며, 최종 가격은 주문 접수 후 확인됩니다. 사이즈와 옵션에 따라 실제 제작비가 변동될 수 있습니다.
                </p>
              </div>

              <div className="mt-6 border-t border-birch-200 pt-6">
                <div className="flex items-end justify-between">
                  <span className="text-base font-medium text-charcoal">총 견적</span>
                  <span className="font-serif text-3xl font-bold text-charcoal">{formatWon(breakdown.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <WizardNav onBack={onBack} onNext={onNext} nextLabel="주문하기" isLast />
    </div>
  );
}

function doorPositionLabel(p: string): string {
  if (p === "front") return "정면";
  if (p === "left") return "좌측";
  return "우측";
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-birch-200 bg-white p-5">
      <h4 className="text-sm font-semibold text-charcoal">{title}</h4>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-charcoal-muted">{label}</span>
      <span className="font-medium text-charcoal">{value}</span>
    </div>
  );
}

function BreakdownList({ breakdown }: { breakdown: PriceBreakdown }) {
  const items = [
    { label: "기본 제작비", value: breakdown.baseFee },
    { label: "자작나무 면적 비용", value: breakdown.areaCost },
    { label: "사이즈 증가 비용", value: breakdown.scaleCost },
    { label: "디자인 추가비", value: breakdown.designCost },
    { label: "옵션 추가비", value: breakdown.optionCost },
    { label: "포장비", value: breakdown.packagingFee },
    { label: "배송비", value: breakdown.shippingFee, note: breakdown.shippingFee === 0 ? "무료" : undefined },
  ];

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <span className="text-sm text-charcoal-muted">{item.label}</span>
          <span className="text-sm font-medium text-charcoal">
            {item.note ? (
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-birch-500" />
                <span>{item.note}</span>
              </span>
            ) : (
              formatWon(item.value)
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
