import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Package } from "lucide-react";
import { fetchProductById } from "@/lib/api";
import type { ProductRow } from "@/types/database";
import { formatWon } from "@/lib/pricing";
import { parseDetailContent } from "@/components/admin/DetailEditor";

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (to: string) => void;
  onOrder: (product: ProductRow) => void;
}

export function ProductDetailPage({ productId, onNavigate, onOrder }: ProductDetailPageProps) {
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchProductById(productId);
        if (!data) {
          setError("상품을 찾을 수 없습니다.");
          return;
        }
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "상품을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  return (
    <main className="min-h-screen bg-ivory pt-20 md:pt-24">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8 md:py-16 lg:px-12">
        <button
          onClick={() => onNavigate("/custom")}
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal-muted transition-colors hover:text-charcoal"
        >
          <ArrowLeft size={16} />
          상품 선택으로
        </button>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 size={28} className="animate-spin text-birch-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Package size={36} className="text-birch-300" />
            <p className="text-sm text-charcoal-muted">{error}</p>
            <button onClick={() => onNavigate("/custom")} className="btn-outline text-sm mt-2">
              목록으로
            </button>
          </div>
        ) : product ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="overflow-hidden rounded-3xl border border-birch-200 bg-white">
              <div className="aspect-square bg-birch-50">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-charcoal-muted">
                    이미지 없음
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="font-serif text-3xl text-charcoal sm:text-4xl">{product.name}</h1>
              <p className="mt-3 text-sm leading-relaxed text-charcoal-muted">{product.description}</p>

              <div className="mt-6 rounded-2xl bg-birch-50 p-5">
                <div className="grid grid-cols-2 gap-4">
                  <SpecCard label="기본 사이즈" value={`${product.base_width}×${product.base_depth}×${product.base_height}mm`} />
                  <SpecCard label="기본 가격" value={formatWon(product.base_price)} />
                </div>
              </div>

              {product.detail_content && (
                <div className="mt-8">
                  <h2 className="text-base font-semibold text-charcoal">상세 정보</h2>
                  <div className="mt-4 space-y-4">
                    {parseDetailContent(product.detail_content).map((block) =>
                      block.type === "text" ? (
                        block.text ? (
                          <p key={block.id} className="whitespace-pre-line text-sm leading-relaxed text-charcoal-light">
                            {block.text}
                          </p>
                        ) : null
                      ) : (
                        block.imageUrl ? (
                          <img
                            key={block.id}
                            src={block.imageUrl}
                            alt="상세 이미지"
                            className="w-full rounded-xl border border-birch-200"
                          />
                        ) : null
                      )
                    )}
                  </div>
                </div>
              )}

              <div className="mt-auto pt-8">
                <button
                  onClick={() => onOrder(product)}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-charcoal px-8 py-4 text-base font-medium text-ivory transition-all hover:bg-charcoal-light active:scale-[0.98]"
                >
                  이 상품으로 사이즈 선택하기
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-charcoal-muted">{label}</p>
      <p className="mt-1 text-base font-bold text-charcoal">{value}</p>
    </div>
  );
}
