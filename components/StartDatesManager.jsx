'use client';

/**
 * StartDatesManager
 *
 * Props:
 *   dates    {Array}             – current list of start-date objects
 *                                  { _id?, startDate, soldOut?, participants? }
 *   onChange {Function}          – called with the new dates array after any change
 *   tourId   {string|undefined}  – undefined  → create mode (all changes are local)
 *                                  string     → edit mode   (adding calls the API,
 *                                               remove/edit are local until form save)
 *
 * Behaviour:
 *   • Create mode (tourId === undefined):
 *       Adding pushes { startDate } into the local list.
 *       Removing splices it out locally.
 *       Max 3 dates.
 *
 *   • Edit mode (tourId is set):
 *       Adding  → POST /tours/:id via createTourStartDate, syncs backend response.
 *       Editing → local only (date value change is kept in form state and saved with
 *                 the main updateTour submit).
 *       Removing → local only (same, sent with the main updateTour submit).
 *       Max 3 *active* (future + not sold-out) dates.
 */

import { useRef } from 'react';
import { Trash2, CalendarPlus } from 'lucide-react';
import { useCreateTourStartDateMutation } from '@/features/tourSlice';
import { useAlert } from '@/context/AlertContext';

export default function StartDatesManager({ dates = [], onChange, tourId }) {
  const { showAlert } = useAlert();
  const inputRef = useRef(null);

  const [createTourStartDate, { isLoading: isAdding }] =
    useCreateTourStartDateMutation();

  const isEditMode = !!tourId;
  const now = new Date();

  /* ─── Helpers ───────────────────────────────────────────────── */

  const activeCount = dates.filter(
    (d) => d.startDate && new Date(d.startDate) >= now && !d.soldOut
  ).length;

  const canAddMore = activeCount < 3;

  const toDateStr = (raw) =>
    raw ? new Date(raw).toISOString().split('T')[0] : '';

  /* ─── Add date ──────────────────────────────────────────────── */

  const handleAdd = async () => {
    const val = inputRef.current?.value;
    if (!val) return;

    // Block duplicate among active future dates
    const exists = dates.some((d) => {
      const str = toDateStr(d.startDate);
      const isFuture = d.startDate && new Date(d.startDate) >= now;
      return isFuture && !d.soldOut && str === val;
    });
    if (exists) {
      showAlert('error', 'This date is already added.');
      return;
    }

    if (isEditMode) {
      // API call — backend persists the new date immediately
      try {
        const res = await createTourStartDate({
          id: tourId,
          body: { startDate: val, soldOut: false },
        }).unwrap();
        const updatedTour = res?.data?.tour;
        const newDates =
          updatedTour?.startDates ??
          [...dates, { startDate: val, soldOut: false, participants: 0 }];
        onChange(newDates);
        if (inputRef.current) inputRef.current.value = '';
        showAlert('success', 'Start date added successfully!');
      } catch (err) {
        showAlert('error', err?.data?.message || 'Failed to add start date.');
      }
    } else {
      // Create mode — local only
      onChange([...dates, { startDate: val }]);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  /* ─── Remove date (local only — saved with the main form submit) ── */

  const handleRemove = (index) => {
    if (!isEditMode && dates.length <= 1) {
      showAlert('error', 'At least one start date is required.');
      return;
    }
    if (isEditMode && dates.length <= 1) {
      showAlert('error', 'A tour must have at least one start date.');
      return;
    }
    onChange(dates.filter((_, i) => i !== index));
  };

  /* ─── Edit date value (local only — saved with the main form submit) ── */

  const handleDateChange = (index, newVal) => {
    if (!newVal) return;
    const updated = [...dates];
    updated[index] = { ...updated[index], startDate: newVal };
    onChange(updated);
  };

  /* ─── Render ─────────────────────────────────────────────────── */

  return (
    <div className="pt-2 border-t border-grey-100">
      <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
        Start Dates *{' '}
        <span className="font-normal normal-case text-grey-400">
          (up to 3 active dates)
        </span>
      </label>

      <div className="space-y-3">
        {/* ── Existing dates list ── */}
        {dates.map((d, index) => {
          const dateVal = toDateStr(d.startDate);
          const isPassed = d.startDate ? new Date(d.startDate) < now : false;
          const isSoldOut = !!d.soldOut;
          const isStruck = isPassed || isSoldOut;

          return (
            <div
              key={d._id || index}
              className={`flex gap-2 items-center rounded-xl px-2 py-1 transition-colors ${
                isStruck ? 'bg-grey-50 border border-grey-200' : ''
              }`}
            >
              {/* Date input */}
              <div className="flex-1 relative">
                <input
                  type="date"
                  value={dateVal}
                  readOnly={isPassed}
                  onChange={(e) => {
                    if (isPassed) return;
                    handleDateChange(index, e.target.value);
                  }}
                  className={`w-full px-4 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:border-primary transition-colors ${
                    isStruck
                      ? 'bg-grey-100 border-grey-200 text-grey-400 line-through cursor-not-allowed'
                      : 'bg-grey-100 border-grey-200 text-grey-700'
                  }`}
                />
                {isSoldOut && !isPassed && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5 pointer-events-none">
                    Sold Out
                  </span>
                )}
                {isPassed && (
                  <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[10px] font-bold text-grey-400 bg-grey-100 border border-grey-200 rounded-full px-2 py-0.5 pointer-events-none">
                    Passed
                  </span>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Remove Date"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}

        {/* ── Empty state ── */}
        {dates.length === 0 && (
          <p className="text-xs text-grey-400 italic">
            No start dates added yet. At least 1 is required.
          </p>
        )}

        {/* ── Add new date ── */}
        {canAddMore && (
          <div className="flex gap-2 pt-1">
            <input
              ref={inputRef}
              type="date"
              min={new Date().toISOString().split('T')[0]}
              disabled={isAdding}
              className="flex-1 px-4 py-2 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium disabled:opacity-60"
            />
            <button
              type="button"
              disabled={isAdding}
              onClick={handleAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-grey-200 hover:bg-grey-300 disabled:opacity-60 text-grey-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
            >
              <CalendarPlus size={14} />
              {isAdding ? 'Adding…' : 'Add Date'}
            </button>
          </div>
        )}

        {!canAddMore && (
          <p className="text-xs text-grey-400 italic">
            Maximum of 3 active dates reached.
          </p>
        )}
      </div>
    </div>
  );
}
