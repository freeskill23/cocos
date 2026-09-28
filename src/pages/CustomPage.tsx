import { useState } from "react";
import { WizardSteps } from "@/components/WizardSteps";
import { Step1Product } from "@/components/custom/Step1Product";
import { Step2Size } from "@/components/custom/Step2Size";
import { Step3Order } from "@/components/custom/Step3Order";
import { DEFAULT_PRICING, DEFAULT_SIZES, type PricingSettings, type SizeSettings } from "@/config/pricing";
import type { ProductRow } from "@/types/database";

const WIZARD_STEPS = ["상품 선택", "사이즈", "주문"];

interface CustomPageProps {
  onNavigate: (to: string) => void;
}

export function CustomPage({ onNavigate }: CustomPageProps) {
  const [step, setStep] = useState(0);
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [dimensions, setDimensions] = useState({ width: 750, depth: 550, height: 600 });
  const [pricing, setPricing] = useState<PricingSettings>(DEFAULT_PRICING);
  const [sizes, setSizes] = useState<SizeSettings>(DEFAULT_SIZES);

  const next = () => setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleSelectProduct = (p: ProductRow, pricingSettings: PricingSettings, sizeSettings: SizeSettings) => {
    setProduct(p);
    setPricing(pricingSettings);
    setSizes(sizeSettings);
    setDimensions({
      width: p.base_width,
      depth: p.base_depth,
      height: p.base_height,
    });
  };

  const handleRestart = () => {
    setStep(0);
    setProduct(null);
  };

  return (
    <main className="min-h-screen bg-ivory pt-20 md:pt-24">
      <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 md:py-16 lg:px-12">
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-[0.25em] text-charcoal-muted">
            COCOS FIT · 코코스핏
          </p>
          <h1 className="mt-3 font-serif text-3xl text-charcoal sm:text-4xl">
            강아지집 만들기
          </h1>
        </div>

        <div className="mb-12 rounded-2xl border border-birch-200 bg-white p-5 sm:p-6">
          <WizardSteps current={step} steps={WIZARD_STEPS} />
        </div>

        <div className="rounded-3xl border border-birch-200 bg-white p-6 sm:p-8 md:p-10">
          {step === 0 && (
            <Step1Product
              selected={product}
              onSelect={handleSelectProduct}
              onNext={next}
              onBack={() => onNavigate("/")}
            />
          )}
          {step === 1 && product && (
            <Step2Size
              product={product}
              dimensions={dimensions}
              onChange={setDimensions}
              sizes={sizes}
              pricing={pricing}
              onNext={next}
              onBack={back}
            />
          )}
          {step === 2 && product && (
            <Step3Order
              product={product}
              dimensions={dimensions}
              pricing={pricing}
              sizes={sizes}
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
