import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Star, XCircle, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Dialog } from '../../components/ui/dialog';
import { Spinner } from '../../components/ui/spinner';
import { Badge, type BadgeVariant } from '../../components/ui/badge';
import { useToast } from '../../components/ui/toast';
import * as reviewsApi from '../../services/reviewsApi';
import * as restaurantApi from '../../services/restaurantApi';
import * as branchApi from '../../services/branchApi';
import { QUERY_KEYS, REVIEW_STATUS_LABELS } from '../../utils/constants';
import { formatRelativeTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/apiError';
import type { Review, ReviewFilters, ReviewStatus } from '../../types';

// ─── Star display ─────────────────────────────────────────────────────────────

function StarRow({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'h-6 w-6' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} ${n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-300'}`}
        />
      ))}
    </span>
  );
}

// ─── Rating breakdown progress bar ────────────────────────────────────────────

const STAR_BAR_COLORS: Record<number, string> = {
  5: 'bg-green-500',
  4: 'bg-lime-400',
  3: 'bg-yellow-400',
  2: 'bg-orange-400',
  1: 'bg-red-500',
};

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="flex w-7 shrink-0 items-center gap-0.5 text-xs text-slate-600">
        {star}<Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${STAR_BAR_COLORS[star]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-right text-xs tabular-nums text-slate-500">{count}</span>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<ReviewStatus, BadgeVariant> = {
  approved: 'success',
  hidden: 'muted',
  flagged: 'danger',
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-4 w-20 rounded bg-slate-200" />
      </div>
      <div className="mt-3 h-3 w-24 rounded bg-slate-100" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-4/5 rounded bg-slate-100" />
      </div>
      <div className="mt-4 h-8 w-28 rounded bg-slate-100" />
    </div>
  );
}

// ─── Reply modal ──────────────────────────────────────────────────────────────

interface ReplyModalProps {
  review: Review;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updated: Review) => void;
}

function ReplyModal({ review, open, onOpenChange, onSuccess }: ReplyModalProps) {
  const toast = useToast();
  const isEdit = Boolean(review.owner_reply);
  const [text, setText] = useState(review.owner_reply ?? '');
  const [submitting, setSubmitting] = useState(false);

  const MIN = 10;
  const MAX = 500;
  const remaining = MAX - text.length;

  async function handleSubmit() {
    const trimmed = text.trim();
    if (trimmed.length < MIN) {
      toast.error(`Reply must be at least ${MIN} characters.`);
      return;
    }
    setSubmitting(true);
    try {
      const updated = isEdit
        ? await reviewsApi.updateReply(review.id, trimmed)
        : await reviewsApi.postReply(review.id, trimmed);
      toast.success(isEdit ? 'Reply updated successfully.' : 'Reply posted successfully.');
      onSuccess(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to submit reply. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => { if (!submitting) onOpenChange(o); }}
      title={`${isEdit ? 'Edit Reply to' : 'Reply to'} ${review.customer_name ?? 'Customer'}'s Review`}
    >
      {/* Original review */}
      <div className="mb-4 rounded-lg bg-slate-50 p-3">
        <StarRow rating={review.rating} size="sm" />
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
          {review.review_text ?? '(No review text)'}
        </p>
      </div>

      {/* Reply textarea */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-700">Your response</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          placeholder="Write your response here..."
          rows={5}
          disabled={submitting}
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:opacity-60"
        />
        <div className="flex items-center justify-between">
          <span className={`text-xs ${text.trim().length < MIN ? 'text-red-500' : 'text-slate-400'}`}>
            {text.trim().length < MIN ? `${MIN - text.trim().length} more chars needed` : ''}
          </span>
          <span className={`text-xs tabular-nums ${remaining < 50 ? 'text-orange-500' : 'text-slate-400'}`}>
            {remaining} / {MAX}
          </span>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting || text.trim().length < MIN}
          className="bg-brand-600 text-white hover:bg-brand-700"
        >
          {submitting ? <Spinner className="h-4 w-4" /> : null}
          {isEdit ? 'Save Changes' : 'Submit Reply'}
        </Button>
      </div>
    </Dialog>
  );
}

// ─── Review card ──────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: Review;
  onReplyClick: (review: Review) => void;
}

function ReviewCard({ review, onReplyClick }: ReviewCardProps) {
  const canReply = review.status === 'approved';

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-semibold text-slate-900">
            {review.customer_name ?? 'Anonymous'}
          </span>
          <StarRow rating={review.rating} />
          <span className="text-xs text-slate-400">{formatRelativeTime(review.created_at)}</span>
        </div>
        <Badge variant={STATUS_BADGE[review.status]}>
          {REVIEW_STATUS_LABELS[review.status]}
        </Badge>
      </div>

      {/* Branch name */}
      {review.branch_name && (
        <p className="mt-1.5 text-xs text-slate-400">{review.branch_name}</p>
      )}

      {/* Review text */}
      {review.review_text && (
        <p className="mt-2.5 text-sm leading-relaxed text-slate-700">{review.review_text}</p>
      )}

      {/* Reply section */}
      <div className="mt-4">
        {review.owner_reply ? (
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your Reply
            </p>
            <div className="rounded-lg bg-blue-50 px-3.5 py-3 text-sm leading-relaxed text-slate-700">
              {review.owner_reply}
            </div>
            {canReply && (
              <button
                onClick={() => onReplyClick(review)}
                className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-slate-600"
              >
                <Edit2 className="h-3 w-3" />
                Edit Reply
              </button>
            )}
          </div>
        ) : canReply ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReplyClick(review)}
            className="gap-1.5 border-brand-300 text-brand-600 hover:bg-brand-50"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Write a Reply
          </Button>
        ) : (
          <p className="text-xs text-slate-400 italic">
            Replies are disabled for {review.status} reviews.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 10;

export function ReviewsTab({ brandId }: { brandId: string }) {
  const queryClient = useQueryClient();

  const [branchId, setBranchId] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [status, setStatus] = useState<ReviewStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);

  // Branches for the filter dropdown
  const { data: restaurants = [] } = useQuery({
    queryKey: QUERY_KEYS.restaurants(brandId),
    queryFn: () => restaurantApi.listByBrand(brandId),
  });
  const firstRestaurantId = restaurants[0]?.id;
  const { data: branches = [] } = useQuery({
    queryKey: QUERY_KEYS.branches(firstRestaurantId ?? ''),
    queryFn: () => branchApi.listByRestaurant(firstRestaurantId as string),
    enabled: Boolean(firstRestaurantId),
  });

  // Summary
  const { data: summaryData, isLoading: loadingSummary } = useQuery({
    queryKey: QUERY_KEYS.reviewSummary(brandId),
    queryFn: reviewsApi.summary,
  });

  // Active filters
  const activeFilters: ReviewFilters = {
    ...(branchId  && { branch_id: branchId }),
    ...(rating    && { rating }),
    ...(status    && { status }),
    ...(fromDate  && { from: fromDate }),
    ...(toDate    && { to: toDate }),
    ...(search    && { search }),
    page,
    limit: PAGE_LIMIT,
  };

  const { data: reviewsData, isLoading: loadingReviews } = useQuery({
    queryKey: QUERY_KEYS.reviews(brandId, activeFilters as Record<string, unknown>),
    queryFn: () => reviewsApi.list(activeFilters),
  });

  const reviews = reviewsData?.reviews ?? [];
  const total = reviewsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const hasFilters = Boolean(branchId || rating || status || fromDate || toDate || search);

  function clearFilters() {
    setBranchId('');
    setRating('');
    setStatus('');
    setFromDate('');
    setToDate('');
    setSearch('');
    setPage(1);
  }

  function handleReplySuccess(updated: Review) {
    // Update the review in the paginated list
    queryClient.setQueryData(
      QUERY_KEYS.reviews(brandId, activeFilters as Record<string, unknown>),
      (old: typeof reviewsData) => {
        if (!old) return old;
        return {
          ...old,
          reviews: old.reviews.map((r) => (r.id === updated.id ? updated : r)),
        };
      },
    );
  }

  const sd = summaryData;
  const totalReviews = sd?.total_reviews ?? 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-slate-900">Reviews & Ratings</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Read and respond to customer feedback for your brand
        </p>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Overall rating */}
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          {loadingSummary ? (
            <Spinner className="h-6 w-6 text-slate-300" />
          ) : (
            <>
              <p className="text-5xl font-bold text-slate-900 tabular-nums">
                {sd ? sd.avg_rating.toFixed(1) : '—'}
              </p>
              <StarRow rating={Math.round(sd?.avg_rating ?? 0)} size="lg" />
              <p className="text-sm text-slate-500">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''} total
              </p>
            </>
          )}
        </div>

        {/* Rating breakdown */}
        <div className="flex flex-col justify-center gap-2.5 rounded-xl border border-slate-100 bg-white px-6 py-5 shadow-sm">
          {loadingSummary ? (
            <div className="flex h-24 items-center justify-center">
              <Spinner className="h-5 w-5 text-slate-300" />
            </div>
          ) : (
            [5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={sd?.rating_breakdown[`${star}_star` as keyof typeof sd.rating_breakdown] ?? 0}
                total={totalReviews}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="w-44">
          <Select
            value={branchId}
            onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
            aria-label="Filter by branch"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
        <div className="w-32">
          <Select
            value={String(rating)}
            onChange={(e) => { setRating(e.target.value ? Number(e.target.value) : ''); setPage(1); }}
            aria-label="Filter by rating"
          >
            <option value="">All Ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n}★</option>
            ))}
          </Select>
        </div>
        <div className="w-36">
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value as ReviewStatus | ''); setPage(1); }}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="hidden">Hidden</option>
            <option value="flagged">Flagged</option>
          </Select>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            aria-label="From date"
            className="w-36"
          />
          <span className="text-xs text-slate-400">to</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            aria-label="To date"
            className="w-36"
          />
        </div>
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search customer or review…"
          aria-label="Search reviews"
          className="w-52"
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <XCircle className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* ── Review cards ── */}
      {loadingReviews ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => <ReviewSkeleton key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <Star className="h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-600">
            {hasFilters ? 'No reviews match your filters.' : 'No reviews yet for this brand.'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-brand-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReplyClick={setReplyTarget}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loadingReviews && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 text-sm">
          <span className="text-slate-500">
            {total} review{total !== 1 ? 's' : ''} total
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="min-w-[4rem] text-center tabular-nums text-slate-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ── Reply modal ── */}
      {replyTarget && (
        <ReplyModal
          review={replyTarget}
          open={Boolean(replyTarget)}
          onOpenChange={(open) => { if (!open) setReplyTarget(null); }}
          onSuccess={handleReplySuccess}
        />
      )}
    </div>
  );
}
