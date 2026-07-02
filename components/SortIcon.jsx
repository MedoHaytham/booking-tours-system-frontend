import { ChevronDown, ChevronUp } from "lucide-react";

export default function SortIcon({ field, activeSort }) {
  const isDesc = activeSort === `-${field}`;
  const isAsc = activeSort === field;
  if (isDesc) return <ChevronDown size={14} className="text-primary" />;
  if (isAsc) return <ChevronUp size={14} className="text-primary" />;
  return <ChevronDown size={14} className="text-grey-400 opacity-50" />;
}