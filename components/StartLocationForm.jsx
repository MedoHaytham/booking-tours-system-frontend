'use client';

import { MapPin } from 'lucide-react';

/**
 * StartLocationForm
 *
 * Props:
 *   value    {Object}   – startLocation object: { address, description, coordinates: [lng, lat] }
 *   onChange {Function} – called with updated startLocation object
 */
export default function StartLocationForm({ value = {}, onChange }) {
  const address = value?.address || '';
  const description = value?.description || '';
  const lng = value?.coordinates?.[0] ?? '';
  const lat = value?.coordinates?.[1] ?? '';

  const updateField = (field, val) => {
    onChange({
      ...value,
      [field]: val
    });
  };

  const updateCoordinates = (index, val) => {
    const coords = [...(value?.coordinates || [0, 0])];
    coords[index] = val === '' ? '' : Number(val);
    onChange({
      ...value,
      coordinates: coords
    });
  };

  return (
    <div className="pt-2 border-t border-grey-100 space-y-3">
      <label className="flex text-xs font-bold uppercase tracking-wider text-grey-500 items-center gap-1">
        <MapPin size={14} className="text-primary" /> Start Location
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Address</label>
          <input
            type="text"
            placeholder="e.g. Biscayne Bay"
            value={address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Description</label>
          <input
            type="text"
            placeholder="e.g. Miami, USA"
            value={description}
            onChange={(e) => updateField('description', e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 25.79"
            value={lat}
            onChange={(e) => updateCoordinates(1, e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-grey-450 uppercase mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            placeholder="e.g. -80.13"
            value={lng}
            onChange={(e) => updateCoordinates(0, e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-grey-100 border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
          />
        </div>
      </div>
    </div>
  );
}
