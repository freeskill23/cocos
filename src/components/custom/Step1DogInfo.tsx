import { useState } from "react";
import { Sparkles } from "lucide-react";
import { WizardNav } from "@/components/WizardNav";
import { recommendSize } from "@/lib/recommendSize";

export interface DogInfo {
  name: string;
  breed: string;
  weight: string;
  bodyLength: string;
  memo: string;
}

interface Step1Props {
  info: DogInfo;
  onChange: (info: DogInfo) => void;
  onNext: () => void;
  onBack: () => void;
  onApplyRecommend: (w: number, d: number, h: number) => void;
}

export function Step1DogInfo({ info, onChange, onNext, onBack, onApplyRecommend }: Step1Props) {
  const [recommendResult, setRecommendResult] = useState<{ w: number; d: number; h: number } | null>(null);

  const handleRecommend = () => {
    const weight = parseFloat(info.weight);
    const bodyLength = info.bodyLength ? parseFloat(info.bodyLength) : undefined;
    if (isNaN(weight) || weight <= 0) return;
    const result = recommendSize(weight, bodyLength);
    setRecommendResult({ w: result.width, d: result.depth, h: result.height });
  };

  const handleApply = () => {
    if (recommendResult) {
      onApplyRecommend(recommendResult.w, recommendResult.d, recommendResult.h);
    }
    onNext();
  };

  const update = (key: keyof DogInfo, value: string) => {
    onChange({ ...info, [key]: value });
  };

  return (
    <div>
      <StepHeader
        title="반려견 정보"
        desc="우리 아이의 정보를 알려주시면 더 정확한 사이즈 추천을 받을 수 있어요."
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Field label="강아지 이름" optional>
          <input
            type="text"
            value={info.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="예: 몽이"
            className="input-field"
          />
        </Field>
        <Field label="견종" optional>
          <input
            type="text"
            value={info.breed}
            onChange={(e) => update("breed", e.target.value)}
            placeholder="예: 비숑"
            className="input-field"
          />
        </Field>
        <Field label="몸무게 (kg)">
          <input
            type="number"
            value={info.weight}
            onChange={(e) => update("weight", e.target.value)}
            placeholder="예: 6.8"
            min="0"
            step="0.1"
            className="input-field"
          />
        </Field>
        <Field label="몸길이 (cm)" optional>
          <input
            type="number"
            value={info.bodyLength}
            onChange={(e) => update("bodyLength", e.target.value)}
            placeholder="예: 35"
            min="0"
            className="input-field"
          />
        </Field>
      </div>

      <Field label="메모" optional>
        <textarea
          value={info.memo}
          onChange={(e) => update("memo", e.target.value)}
          placeholder="특이사항이나 요청사항을 자유롭게 적어주세요."
          rows={3}
          className="input-field resize-none"
        />
      </Field>

      {/* Recommend */}
      <div className="mt-8 rounded-2xl border border-birch-200 bg-birch-50 p-5">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-birch-500" />
          <h3 className="text-sm font-semibold text-charcoal">사이즈 추천받기</h3>
        </div>
        <p className="mt-2 text-sm text-charcoal-muted">
          몸무게와 몸길이를 바탕으로 적정 사이즈를 추천해드려요. 추천값은 참고용이며 다음 단계에서 자유롭게 조정할 수 있습니다.
        </p>
        <button
          onClick={handleRecommend}
          disabled={!info.weight || parseFloat(info.weight) <= 0}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-charcoal/20 px-5 py-2.5 text-sm font-medium text-charcoal transition-all hover:border-charcoal hover:bg-charcoal hover:text-ivory disabled:opacity-40"
        >
          추천 사이즈 보기
        </button>

        {recommendResult && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl bg-white p-4">
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-charcoal-muted">가로</p>
                <p className="text-lg font-bold text-charcoal">{recommendResult.w}mm</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-muted">세로</p>
                <p className="text-lg font-bold text-charcoal">{recommendResult.d}mm</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-muted">높이</p>
                <p className="text-lg font-bold text-charcoal">{recommendResult.h}mm</p>
              </div>
            </div>
            <button
              onClick={handleApply}
              className="ml-auto rounded-full bg-charcoal px-4 py-2 text-xs font-medium text-ivory transition-colors hover:bg-charcoal-light"
            >
              이 사이즈로 진행
            </button>
          </div>
        )}
      </div>

      <WizardNav onBack={onBack} onNext={onNext} nextDisabled={!info.weight || parseFloat(info.weight) <= 0} />
    </div>
  );
}

function StepHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-charcoal-muted">{desc}</p>
    </div>
  );
}

function Field({
  label,
  children,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-charcoal">
        {label}
        {optional && <span className="ml-1.5 text-xs font-normal text-charcoal-muted">(선택)</span>}
      </label>
      {children}
    </div>
  );
}

export { StepHeader, Field };
