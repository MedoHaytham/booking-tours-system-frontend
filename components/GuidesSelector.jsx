'use client';

/**
 * GuidesSelector
 *
 * Props:
 *   selected   {string[]}   – array of guide _id strings currently selected
 *   guidesList {Object[]}   – full list of available guides/lead-guides
 *                             each item: { _id, name, role }
 *   onChange   {Function}   – called with the new selected ids array
 */

import { useRef } from 'react';
import { X, Users, UserPlus } from 'lucide-react';

export default function GuidesSelector({ selected = [], guidesList = [], onChange }) {
  const selectRef = useRef(null);

  const handleAdd = () => {
    const val = selectRef.current?.value;
    if (!val) return;
    if (selected.includes(val)) return;
    onChange([...selected, val]);
    if (selectRef.current) selectRef.current.value = '';
  };

  const handleRemove = (id) => {
    onChange(selected.filter((s) => s !== id));
  };

  const available = guidesList.filter((g) => !selected.includes(g._id));

  return (
    <div className="pt-2 border-t border-grey-100 space-y-3">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-grey-500">
        <Users size={14} className="text-primary" />
        Tour Guides
      </label>

      {/* ── Selected guides chips ── */}
      <div className="flex flex-wrap gap-2">
        {selected.map((guideId) => {
          const guideObj = guidesList.find((g) => g._id === guideId);
          if (!guideObj) return null;
          return (
            <div
              key={guideId}
              className="flex items-center gap-1.5 bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-semibold"
            >
              <span>
                {guideObj.name}{' '}
                <span className="opacity-60">({guideObj.role})</span>
              </span>
              <button
                type="button"
                onClick={() => handleRemove(guideId)}
                className="hover:text-primary-dark transition-colors cursor-pointer flex items-center justify-center"
                title="Remove guide"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        {selected.length === 0 && (
          <span className="text-xs text-grey-400 italic">
            No guides assigned to this tour yet.
          </span>
        )}
      </div>

      {/* ── Add guide dropdown ── */}
      {available.length > 0 ? (
        <div className="flex gap-2">
          <select
            ref={selectRef}
            defaultValue=""
            className="flex-1 px-4 py-2 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-700 focus:outline-none focus:border-primary font-medium cursor-pointer"
          >
            <option value="" disabled>
              Select a guide to add…
            </option>
            {available.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name} ({g.role})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-grey-200 hover:bg-grey-300 text-grey-700 text-xs font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            <UserPlus size={14} />
            Add Guide
          </button>
        </div>
      ) : (
        guidesList.length > 0 && (
          <p className="text-xs text-grey-400 italic">
            All available guides have been assigned.
          </p>
        )
      )}
    </div>
  );
}
