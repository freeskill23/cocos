import { WizardNav } from "@/components/WizardNav";
import { SizePreview } from "@/components/SizePreview";
import { SIZE_LIMITS, SLIDER_STEP } from "@/config/sizes";
import { StepHeader, Field } from "@/components/custom/Step1DogInfo";

interface Step2Props {
  width: number;
  depth: number;
  height: number;
  onChange: (dims: { width: number; depth: number; height: number }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step2Size({ width, depth, height, onChange, onNext, onBack }: Step2Props) {
  return (
    <div>
      <StepHeader
        title="사이즈"
        desc="원하는 가로 · 세로 · 높이를 mm 단위로 직접 입력하세요."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <SizeInput
            label="가로"
            unit="Width"
            value={width}
            min={SIZE_LIMITS.MIN_WIDTH}
            max={SIZE_LIMITS.MAX_WIDTH}
            onChange={(v) => onChange({ width: v, depth, height })}
          />
          <SizeInput
            label="세로"
            unit="Depth"
            value={depth}
            min={SIZE_LIMITS.MIN_DEPTH}
            max={SIZE_LIMITS.MAX_DEPTH}
            onChange={(v) => onChange({ width, depth: v, height })}
          />
          <SizeInput
            label="높이"
            unit="Height"
            value={height}
            min={SIZE_LIMITS.MIN_HEIGHT}
            max={SIZE_LIMITS.MAX_HEIGHT}
            onChange={(v) => onChange({ width, depth, height: v })}
          />
        </div>

        <div className="flex flex-col items-center justify-center rounded-3xl bg-birch-50 p-8 lg:p-12">
          <SizePreview width={width} depth={depth} height={height} />
          <div className="mt-6 grid w-full max-w-xs grid-cols-3 gap-3 text-center">
            <DimCard label="가로" value={width} />
            <DimCard label="세로" value={depth} />
            <DimCard label="높이" value={height} />
          </div>
        </div>
      </div>

      <WizardNav onBack={onBack} onNext={onNext} />
    </div>
  );
}

function SizeInput({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={`${label} · ${unit}`}>
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={SLIDER_STEP}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="w-28 rounded-xl border border-birch-200 bg-white px-4 py-3 text-right text-lg font-semibold text-charcoal focus:border-birch-400 focus:outline-none focus:ring-2 focus:ring-birch-200"
        />
        <span className="text-sm text-charcoal-muted">mm</span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={SLIDER_STEP}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-birch-200 accent-charcoal"
      />
      <div className="mt-1.5 flex justify-between text-[10px] text-charcoal-muted">
        <span>최소 {min}mm</span>
        <span>최대 {max}mm</span>
      </div>
    </Field>
  );
}

function DimCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white py-3">
      <p className="text-xs text-charcoal-muted">{label}</p>
      <p className="mt-1 text-base font-bold text-charcoal">{value}<span className="text-xs font-normal text-charcoal-muted">mm</span></p>
    </div>
  );
}
