import { Check } from "lucide-react";
import { WizardNav } from "@/components/WizardNav";
import { StepHeader } from "@/components/custom/Step1DogInfo";
import { DESIGNS, type DesignId } from "@/config/designs";
import { formatWon } from "@/lib/pricing";

interface Step3Props {
  selected: DesignId;
  onSelect: (id: DesignId) => void;
  onNext: () => void;
  onBack: () => void;
}

export function Step3Design({ selected, onSelect, onNext, onBack }: Step3Props) {
  return (
    <div>
      <StepHeader title="디자인" desc="원하는 디자인 스타일을 선택하세요." />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {DESIGNS.map((design) => {
          const isSelected = selected === design.id;
          return (
            <button
              key={design.id}
              onClick={() => onSelect(design.id)}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border-2 bg-white text-left transition-all duration-300 ${
                isSelected
                  ? "border-charcoal shadow-[0_8px_40px_rgba(184,160,126,0.15)]"
                  : "border-birch-200 hover:border-birch-400"
              }`}
            >
              {isSelected && (
                <div className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-charcoal text-ivory">
                  <Check size={15} />
                </div>
              )}
              <div className="relative aspect-square overflow-hidden bg-birch-50">
                <img
                  src={design.image}
                  alt={`${design.code} ${design.nameEn}`}
                  className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-charcoal/90 px-3 py-1 text-xs font-medium text-ivory">
                  {design.code}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-base font-semibold text-charcoal">
                  {design.nameKr}
                  <span className="ml-2 text-xs font-normal text-charcoal-muted">{design.nameEn}</span>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-muted">{design.description}</p>
                <p className="mt-3 text-sm font-medium text-charcoal">
                  {design.extraPrice === 0 ? "기본가격" : `+${formatWon(design.extraPrice)}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <WizardNav onBack={onBack} onNext={onNext} />
    </div>
  );
}
