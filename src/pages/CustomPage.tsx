import { useState } from "react";
import { WizardSteps } from "@/components/WizardSteps";
import { Step1DogInfo, type DogInfo } from "@/components/custom/Step1DogInfo";
import { Step2Size } from "@/components/custom/Step2Size";
import { Step3Design } from "@/components/custom/Step3Design";
import { Step4Options } from "@/components/custom/Step4Options";
import { Step5Quote } from "@/components/custom/Step5Quote";
import { Step6Order } from "@/components/custom/Step6Order";
import { SIZE_LIMITS } from "@/config/sizes";
import { DEFAULT_DESIGN_ID, type DesignId } from "@/config/designs";
import { DEFAULT_OPTIONS, type OptionChoice } from "@/config/options";

const WIZARD_STEPS = ["반려견 정보", "사이즈", "디자인", "옵션", "견적", "주문"];

interface CustomPageProps {
  onNavigate: (to: string) => void;
}

export function CustomPage({ onNavigate }: CustomPageProps) {
  const [step, setStep] = useState(0);
  const [dogInfo, setDogInfo] = useState<DogInfo>({
    name: "",
    breed: "",
    weight: "",
    bodyLength: "",
    memo: "",
  });
  const [dimensions, setDimensions] = useState({
    width: 750,
    depth: 550,
    height: 600,
  });
  const [designId, setDesignId] = useState<DesignId>(DEFAULT_DESIGN_ID);
  const [options, setOptions] = useState<OptionChoice>(DEFAULT_OPTIONS);

  const next = () => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleApplyRecommend = (w: number, d: number, h: number) => {
    setDimensions({
      width: Math.max(SIZE_LIMITS.MIN_WIDTH, Math.min(SIZE_LIMITS.MAX_WIDTH, w)),
      depth: Math.max(SIZE_LIMITS.MIN_DEPTH, Math.min(SIZE_LIMITS.MAX_DEPTH, d)),
      height: Math.max(SIZE_LIMITS.MIN_HEIGHT, Math.min(SIZE_LIMITS.MAX_HEIGHT, h)),
    });
  };

  const handleRestart = () => {
    setStep(0);
    setDogInfo({ name: "", breed: "", weight: "", bodyLength: "", memo: "" });
    setDimensions({ width: 750, depth: 550, height: 600 });
    setDesignId(DEFAULT_DESIGN_ID);
    setOptions(DEFAULT_OPTIONS);
  };

  return (
    <main className="min-h-screen bg-ivory pt-20 md:pt-24">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 md:py-16 lg:px-12">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-charcoal-muted">
            COCOS FIT · 코코스핏
          </p>
          <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">
            우리 아이 집 만들기
          </h1>
        </div>

        <div className="mb-12 rounded-2xl border border-birch-200 bg-white p-5 sm:p-6">
          <WizardSteps current={step} steps={WIZARD_STEPS} />
        </div>

        <div className="rounded-3xl border border-birch-200 bg-white p-6 sm:p-8 md:p-10">
          {step === 0 && (
            <Step1DogInfo
              info={dogInfo}
              onChange={setDogInfo}
              onNext={next}
              onBack={() => onNavigate("/")}
              onApplyRecommend={handleApplyRecommend}
            />
          )}
          {step === 1 && (
            <Step2Size
              width={dimensions.width}
              depth={dimensions.depth}
              height={dimensions.height}
              onChange={setDimensions}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 2 && (
            <Step3Design
              selected={designId}
              onSelect={setDesignId}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 3 && (
            <Step4Options
              options={options}
              onChange={setOptions}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 4 && (
            <Step5Quote
              dimensions={dimensions}
              designId={designId}
              options={options}
              dogInfo={dogInfo}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 5 && (
            <Step6Order
              dimensions={dimensions}
              designId={designId}
              options={options}
              dogInfo={dogInfo}
              onBack={back}
              onRestart={handleRestart}
              onHome={() => onNavigate("/")}
            />
          )}
        </div>
      </div>
    </main>
  );
}
