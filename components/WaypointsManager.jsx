'use client';

import { useState } from 'react';
import { Map, Trash2 } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';

/**
 * WaypointsManager
 *
 * Props:
 *   locations {Array}    – array of waypoint objects
 *                          { day, address, description, coordinates: [lng, lat] }
 *   onChange  {Function} – called with new locations array
 */
export default function WaypointsManager({ locations = [], onChange }) {
  const { showAlert } = useAlert();
  const [newLoc, setNewLoc] = useState({
    day: 1,
    address: '',
    description: '',
    lat: '',
    lng: ''
  });

  const handleAdd = () => {
    if (!newLoc.address || !newLoc.description) {
      showAlert('error', 'Please fill in address and description.');
      return;
    }

    const coords = [Number(newLoc.lng || 0), Number(newLoc.lat || 0)];
    const updated = [
      ...locations,
      {
        day: Number(newLoc.day || 1),
        address: newLoc.address,
        description: newLoc.description,
        coordinates: coords
      }
    ];

    onChange(updated);
    // Reset form inputs except keeping Day incremented or reset to 1
    setNewLoc({
      day: Number(newLoc.day || 1) + 1,
      address: '',
      description: '',
      lat: '',
      lng: ''
    });
  };

  const handleRemove = (index) => {
    const updated = locations.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="pt-2 border-t border-grey-100 space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 items-center gap-1">
        <span className="flex items-center gap-1">
          <Map size={14} className="text-primary" /> Waypoints (Locations)
        </span>
      </label>

      {/* List of currently added locations */}
      <div className="space-y-2">
        {locations.map((loc, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center bg-grey-50 border border-grey-200 p-2.5 rounded-xl text-xs"
          >
            <div>
              <span className="font-bold text-primary mr-1.5">Day {loc.day}:</span>
              <span className="font-semibold text-grey-700">{loc.address}</span>
              <span className="text-grey-450 ml-1">({loc.description})</span>
              <span className="text-[10px] text-grey-400 block mt-0.5">
                Coordinates: [{loc.coordinates?.[1]}, {loc.coordinates?.[0]}]
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="p-1.5 hover:bg-red-50 text-red-505 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        ))}
        {locations.length === 0 && (
          <span className="text-xs text-grey-450 italic block">
            No waypoints added yet.
          </span>
        )}
      </div>

      {/* Inputs to add new location */}
      <div className="bg-grey-50 border border-grey-200 p-3 rounded-xl space-y-3">
        <span className="block text-[11px] font-bold uppercase tracking-wider text-grey-500">
          Add New Waypoint
        </span>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-1">
            <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">
              Day
            </label>
            <input
              type="number"
              min="1"
              placeholder="1"
              value={newLoc.day}
              onChange={(e) => setNewLoc((p) => ({ ...p, day: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">
              Address
            </label>
            <input
              type="text"
              placeholder="e.g. Biscayne Bay"
              value={newLoc.address}
              onChange={(e) => setNewLoc((p) => ({ ...p, address: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-3">
            <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Miami, USA"
              value={newLoc.description}
              onChange={(e) => setNewLoc((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 24.55"
              value={newLoc.lat}
              onChange={(e) => setNewLoc((p) => ({ ...p, lat: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-grey-450 uppercase mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. -81.78"
              value={newLoc.lng}
              onChange={(e) => setNewLoc((p) => ({ ...p, lng: e.target.value }))}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-grey-200 text-xs text-grey-700 focus:outline-none focus:border-primary font-medium"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Add Waypoint
        </button>
      </div>
    </div>
  );
}
