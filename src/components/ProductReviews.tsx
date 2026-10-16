import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { fetchProductReviews } from "@/lib/api";
import type { ReviewRow } from "@/types/database";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductReviews(productId)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-12 border-t border-birch-200 pt-10">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">사용 후기</h2>
        <div className="mt-8 flex justify-center">
          <Loader2 size={24} className="animate-spin text-birch-400" />
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-12 border-t border-birch-200 pt-10">
        <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">사용 후기</h2>
        <p className="mt-8 text-center text-sm text-charcoal-muted">아직 등록된 후기가 없습니다.</p>
      </div>
    );
  }

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const avgRounded = Math.round(avgRating * 10) / 10;

  return (
    <div className="mt-12 border-t border-birch-200 pt-10">
      <h2 className="font-serif text-2xl text-charcoal sm:text-3xl">사용 후기</h2>

      <div className="mt-6 flex items-center gap-6 rounded-2xl bg-birch-50 px-6 py-5">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={28}
                className={i < Math.round(avgRating) ? "text-birch-500" : "text-birch-200"}
                fill={i < Math.round(avgRating) ? "currentColor" : "none"}
              />
            ))}
          </div>
          <p className="mt-2 text-2xl font-bold text-charcoal">{avgRounded}<span className="text-base text-charcoal-muted"> / 5</span></p>
        </div>
        <div className="flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-6 text-xs text-charcoal-muted">{star}점</span>
                <div className="h-2 w-32 overflow-hidden rounded-full bg-birch-200">
                  <div className="h-full rounded-full bg-birch-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-xs text-charcoal-muted">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="ml-auto text-sm text-charcoal-muted">
          총 {reviews.length}개 후기
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-birch-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-birch-200 text-sm font-bold text-charcoal">
                  {review.author?.[0] ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">{review.author}</p>
                  <p className="text-xs text-charcoal-muted">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString("ko-KR") : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.rating ? "text-birch-500" : "text-birch-200"}
                    fill={i < review.rating ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-charcoal-light">{review.review}</p>

            {review.image_urls && review.image_urls.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {review.image_urls.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block h-20 w-20 overflow-hidden rounded-xl border border-birch-200">
                    <img src={url} alt={`후기 사진 ${idx + 1}`} className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
