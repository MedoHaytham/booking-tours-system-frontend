import React from 'react';

/**
 * StatCard component displays a summary statistic with an icon.
 * Features built-in layout containment to prevent overflow on very long values.
 *
 * @param {object} props
 * @param {React.ReactNode} props.icon - The Lucide icon or element to display
 * @param {string} props.iconBg - Tailwind background color class for the icon wrapper (e.g. 'bg-amber-100')
 * @param {string} props.iconColor - Tailwind text color class for the icon wrapper (e.g. 'text-amber-500')
 * @param {string} props.label - The uppercase label for the stat card
 * @param {string|number} props.value - The statistic value to show
 * @param {boolean} props.isLoading - Whether the page stat is currently loading
 */
export default function StatCard({
  icon,
  iconBg = 'bg-grey-100',
  iconColor = 'text-grey-600',
  label,
  value,
  isLoading = false,
}) {
  return (
    <div className="bg-grey-100 p-5 sm:p-6 rounded-xl border border-grey-200 flex items-center gap-4 sm:gap-5 shadow-sm hover:shadow-md transition-shadow min-w-0 w-full">
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-grey-500 font-bold uppercase tracking-wider truncate" title={label}>
          {label}
        </p>
        <h3 className="text-xl sm:text-2xl font-bold text-grey-700 break-all whitespace-normal" title={typeof value === 'object' ? '' : value}>
          {isLoading ? '...' : value}
        </h3>
      </div>
    </div>
  );
}
