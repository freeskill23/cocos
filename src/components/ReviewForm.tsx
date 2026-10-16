import { useState } from "react";
import { Star, Loader2, X, ImagePlus, Save } from "lucide-react";
import { upsertReview, uploadReviewImage, maskAuthor } from "@/lib/api";
import type { OrderRow } from "@/types/database";

interface ReviewFormProps {
  order: OrderRow;
  onSaved: () => void;
  onClose: () => void;
}

export function ReviewForm({ order, onSaved, onClose }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayRating = hoverRating || rating;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - images.length - pendingFiles.length;
    const toAdd = files.slice(0, remaining);
    if (toAdd.length < files.length) {
      setError("사진은 최대 5장까지 첨부할 수 있습니다.");
    }
    setPendingFiles((prev) => [...prev, ...toAdd]);
    setError(null);
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!review.trim()) {
      setError("후기 내용을 입력해주세요.");
      return;
    }
    if (review.length > 200) {
      setError("후기 내용은 200자까지 입력할 수 있습니다.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of pendingFiles) {
        const url = await uploadReviewImage(file);
        uploadedUrls.push(url);
      }
      const allImages = [...images, ...uploadedUrls];
      await upsertReview({
        dog_name: order.dog_name ?? "고객",
        breed: order.breed ?? "",
        weight: order.weight ?? "",
        size: `${order.width} × ${order.depth} × ${order.height}mm`,
        review: review.trim(),
        author: maskAuthor(order.customer_name),
        display_order: 0,
        is_visible: true,
        rating,
        product_id: order.product_id,
        order_id: order.id,
        image_urls: allImages.length > 0 ? allImages : null,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "후기 작성에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-charcoal/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-charcoal">사용 후기 작성</h2>
          <button onClick={onClose} className="text-charcoal-muted hover:text-charcoal">
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 rounded-xl bg-birch-50 px-4 py-3 text-sm text-charcoal">
          <p>{order.product_name ?? "-"}</p>
          <p className="mt-1 text-xs text-charcoal-muted">{order.width} × {order.depth} × {order.height}mm</p>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">별점</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                    aria-label={`${starValue}점`}
                  >
                    <Star
                      size={32}
                      className={starValue <= displayRating ? "text-birch-500" : "text-birch-200"}
                      fill={starValue <= displayRating ? "currentColor" : "none"}
                    />
                  </button>
                );
              })}
              <span className="ml-2 self-center text-sm font-medium text-charcoal">{displayRating}점</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              후기 내용 <span className="text-xs text-charcoal-muted">({review.length}/200자)</span>
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value.slice(0, 200))}
              rows={4}
              className="input-field resize-none"
              placeholder="제작된 가구에 대한 후기를 남겨주세요. (최대 200자)"
              maxLength={200}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              사진 첨부 <span className="text-xs text-charcoal-muted">(최대 5장)</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {images.map((url, idx) => (
                <div key={`img-${idx}`} className="relative h-20 w-20 overflow-hidden rounded-xl border border-birch-200">
                  <img src={url} alt={`첨부 ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-0 top-0 rounded-bl-lg bg-black/50 p-0.5 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {pendingFiles.map((_, idx) => (
                <div key={`pending-${idx}`} className="relative flex h-20 w-20 items-center justify-center rounded-xl border border-birch-200 bg-birch-50">
                  <Loader2 size={18} className="animate-spin text-charcoal-muted" />
                  <button
                    type="button"
                    onClick={() => removePendingFile(idx)}
                    className="absolute right-0 top-0 rounded-bl-lg bg-black/50 p-0.5 text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {images.length + pendingFiles.length < 5 && (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-birch-300 text-charcoal-muted transition-colors hover:border-birch-500 hover:text-charcoal">
                  <ImagePlus size={20} />
                  <span className="text-[10px]">사진 추가</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileSelect} />
                </label>
              )}
            </div>
          </div>

          {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-outline flex-1 text-sm">취소</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 text-sm">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              후기 등록
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
