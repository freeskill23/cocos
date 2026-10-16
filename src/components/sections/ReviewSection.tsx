import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { fetchVisibleReviews } from "@/lib/api";
import type { ReviewRow } from "@/types/database";
import { REVIEWS } from "@/config/reviews";

export function ReviewSection() {
  const [items, setItems] = useState<ReviewRow[] | null>(null);

  useEffect(() => {
    fetchVisibleReviews()
      .then(setItems)
      .catch(() => setItems(null));
  }, []);

  const displayItems = items ?? REVIEWS.map((r, i) => ({
    id: String(i),
    dog_name: r.dogName,
    breed: r.breed,
    weight: r.weight,
    size: r.size,
    review: r.review,
    author: r.author,
    display_order: i,
    is_visible: true,
    created_at: "",
    rating: 5,
    product_id: null,
    order_id: null,
    image_urls: null,
  }));

  const avgRating = displayItems.length > 0
    ? displayItems.reduce((sum, r) => sum + (r.rating || 5), 0) / displayItems.length
    : 5;

  return (
    <section id="reviews" className="bg-white section-padding">
      <div className="container-wide">
        <Reveal>
          <p className="text-center text-xs font-semibold tracking-[0.25em] text-charcoal-muted">
            REVIEWS
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl text-center font-serif text-3xl leading-snug text-charcoal text-balance sm:text-4xl md:text-5xl">
            맞춤 제작을 경험한 고객의 이야기
          </h2>
          {items && items.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.round(avgRating) ? "text-birch-500" : "text-birch-200"}
                    fill={i < Math.round(avgRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-charcoal">
                {Math.round(avgRating * 10) / 10} / 5
              </span>
              <span className="text-sm text-charcoal-muted">({items.length}개 후기)</span>
            </div>
          )}
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {displayItems.map((review, i) => (
            <Reveal key={review.id} delay={i * 120}>
              <article className="flex h-full flex-col rounded-3xl border border-birch-200 bg-birch-50 p-6">
                <div className="flex gap-1 text-birch-400">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      size={16}
                      className={j < (review.rating || 5) ? "text-birch-400" : "text-birch-200"}
                      fill={j < (review.rating || 5) ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-birch-200 text-sm font-bold text-charcoal">
                    {review.author?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{review.author}</p>
                    <p className="text-xs text-charcoal-muted">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString("ko-KR") : ""}
                    </p>
                  </div>
                </div>

                <p className="mt-4 flex-1 text-sm leading-relaxed text-charcoal-light">
                  "{review.review}"
                </p>

                {review.image_urls && review.image_urls.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.image_urls.slice(0, 3).map((url, idx) => (
                      <img key={idx} src={url} alt={`후기 사진 ${idx + 1}`} className="h-16 w-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}

                <p className="mt-4 border-t border-birch-200 pt-4 text-xs text-charcoal-muted">
                  {review.author}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
