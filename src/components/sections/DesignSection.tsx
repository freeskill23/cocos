import { Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { DESIGNS } from "@/config/designs";
import { formatWon } from "@/lib/pricing";

interface DesignSectionProps {
  onNavigate: (to: string) => void;
}

export function DesignSection({ onNavigate }: DesignSectionProps) {
  return (
    <section id="designs" className="bg-birch-50 section-padding">
      <div className="container-wide">
        <Reveal>
          <p className="text-center text-xs font-semibold tracking-[0.25em] text-charcoal-muted">
            DESIGN
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-center font-serif text-3xl leading-snug text-charcoal text-balance sm:text-4xl md:text-5xl">
            세 가지 디자인으로
            <br />
            시작합니다.
          </h2>
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {DESIGNS.map((design, i) => (
            <Reveal key={design.id} delay={i * 120}>
              <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-birch-200 bg-white transition-all duration-300 hover:border-birch-400 hover:shadow-[0_8px_40px_rgba(184,160,126,0.12)]">
                <div className="relative aspect-square overflow-hidden bg-birch-50">
                  <img
                    src={design.image}
                    alt={`${design.code} ${design.nameEn}`}
                    className="h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-charcoal/90 px-3 py-1.5 text-xs font-medium text-ivory backdrop-blur-sm">
                    {design.code}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-charcoal">
                    {design.nameKr}
                    <span className="ml-2 text-sm font-normal text-charcoal-muted">{design.nameEn}</span>
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-charcoal-muted">
                    {design.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-charcoal-muted">
                      {design.extraPrice === 0 ? "기본가격" : `+${formatWon(design.extraPrice)}`}
                    </span>
                    <button
                      onClick={() => onNavigate("/custom")}
                      className="group/btn inline-flex items-center gap-1.5 text-sm font-medium text-charcoal transition-colors hover:text-charcoal-light"
                    >
                      이 디자인으로 만들기
                      <Check size={15} className="opacity-0 transition-opacity group-hover/btn:opacity-100" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
