import { WizardNav } from "@/components/WizardNav";
import { StepHeader, Field } from "@/components/custom/Step1DogInfo";
import {
  type OptionChoice,
  type DoorPosition,
  type DoorSizeMode,
  type EngravingMode,
  type FloorType,
  type CushionType,
  type TopType,
  OPTION_PRICES,
} from "@/config/options";
import { formatWon } from "@/lib/pricing";

interface Step4Props {
  options: OptionChoice;
  onChange: (options: OptionChoice) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step4Options({ options, onChange, onNext, onBack }: Step4Props) {
  const update = <K extends keyof OptionChoice>(key: K, value: OptionChoice[K]) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <div>
      <StepHeader title="옵션" desc="출입구, 각인, 바닥판, 쿠션, 상판 등 원하는 옵션을 선택하세요." />

      <div className="mt-8 space-y-8">
        {/* Door position */}
        <OptionGroup label="출입구 위치">
          <ChoiceGrid>
            <ChoiceButton
              label="정면"
              price={OPTION_PRICES.doorPosition.front}
              selected={options.doorPosition === "front"}
              onClick={() => update("doorPosition", "front" as DoorPosition)}
            />
            <ChoiceButton
              label="좌측"
              price={OPTION_PRICES.doorPosition.left}
              selected={options.doorPosition === "left"}
              onClick={() => update("doorPosition", "left" as DoorPosition)}
            />
            <ChoiceButton
              label="우측"
              price={OPTION_PRICES.doorPosition.right}
              selected={options.doorPosition === "right"}
              onClick={() => update("doorPosition", "right" as DoorPosition)}
            />
          </ChoiceGrid>
        </OptionGroup>

        {/* Door size mode */}
        <OptionGroup label="출입구 크기">
          <ChoiceGrid>
            <ChoiceButton
              label="추천 사이즈"
              price={OPTION_PRICES.doorSizeMode.recommended}
              selected={options.doorSizeMode === "recommended"}
              onClick={() => update("doorSizeMode", "recommended" as DoorSizeMode)}
            />
            <ChoiceButton
              label="직접 입력"
              price={OPTION_PRICES.doorSizeMode.custom}
              selected={options.doorSizeMode === "custom"}
              onClick={() => update("doorSizeMode", "custom" as DoorSizeMode)}
            />
          </ChoiceGrid>
          {options.doorSizeMode === "custom" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="출입구 가로 (mm)">
                <input
                  type="number"
                  value={options.doorCustomWidth}
                  onChange={(e) => update("doorCustomWidth", Number(e.target.value) || 0)}
                  className="input-field"
                />
              </Field>
              <Field label="출입구 높이 (mm)">
                <input
                  type="number"
                  value={options.doorCustomHeight}
                  onChange={(e) => update("doorCustomHeight", Number(e.target.value) || 0)}
                  className="input-field"
                />
              </Field>
            </div>
          )}
        </OptionGroup>

        {/* Engraving */}
        <OptionGroup label="이름 각인">
          <ChoiceGrid>
            <ChoiceButton
              label="없음"
              price={OPTION_PRICES.engraving.none}
              selected={options.engraving === "none"}
              onClick={() => update("engraving", "none" as EngravingMode)}
            />
            <ChoiceButton
              label="있음"
              price={OPTION_PRICES.engraving.yes}
              selected={options.engraving === "yes"}
              onClick={() => update("engraving", "yes" as EngravingMode)}
            />
          </ChoiceGrid>
          {options.engraving === "yes" && (
            <div className="mt-4">
              <Field label="각인 문구">
                <input
                  type="text"
                  value={options.engravingText}
                  onChange={(e) => update("engravingText", e.target.value)}
                  placeholder="예: COCO"
                  maxLength={20}
                  className="input-field"
                />
              </Field>
            </div>
          )}
        </OptionGroup>

        {/* Floor */}
        <OptionGroup label="바닥판">
          <ChoiceGrid>
            <ChoiceButton
              label="기본"
              price={OPTION_PRICES.floor.standard}
              selected={options.floor === "standard"}
              onClick={() => update("floor", "standard" as FloorType)}
            />
            <ChoiceButton
              label="탈착식"
              price={OPTION_PRICES.floor.removable}
              selected={options.floor === "removable"}
              onClick={() => update("floor", "removable" as FloorType)}
            />
          </ChoiceGrid>
        </OptionGroup>

        {/* Cushion */}
        <OptionGroup label="쿠션">
          <ChoiceGrid>
            <ChoiceButton
              label="없음"
              price={OPTION_PRICES.cushion.none}
              selected={options.cushion === "none"}
              onClick={() => update("cushion", "none" as CushionType)}
            />
            <ChoiceButton
              label="추가"
              price={OPTION_PRICES.cushion.add}
              selected={options.cushion === "add"}
              onClick={() => update("cushion", "add" as CushionType)}
            />
          </ChoiceGrid>
        </OptionGroup>

        {/* Top */}
        <OptionGroup label="상판 기능">
          <ChoiceGrid>
            <ChoiceButton
              label="기본"
              price={OPTION_PRICES.top.standard}
              selected={options.top === "standard"}
              onClick={() => update("top", "standard" as TopType)}
            />
            <ChoiceButton
              label="수납형"
              price={OPTION_PRICES.top.storage}
              selected={options.top === "storage"}
              onClick={() => update("top", "storage" as TopType)}
            />
          </ChoiceGrid>
        </OptionGroup>
      </div>

      <WizardNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

function OptionGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-birch-200 bg-white p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-charcoal">{label}</h3>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChoiceGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function ChoiceButton({
  label,
  price,
  selected,
  onClick,
}: {
  label: string;
  price: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all ${
        selected
          ? "border-charcoal bg-birch-50"
          : "border-birch-200 bg-white hover:border-birch-400"
      }`}
    >
      <span className="text-sm font-medium text-charcoal">{label}</span>
      <span className="text-xs text-charcoal-muted">
        {price === 0 ? "포함" : `+${formatWon(price)}`}
      </span>
    </button>
  );
}
