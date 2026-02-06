'use client';

import { Input } from '@/components/ui/Input';

export type FilterType = 'all' | 'elite' | 'trusted' | 'new';
export type SortType = 'score-desc' | 'recent' | 'transactions';

interface DirectoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  resultCount: number;
}

export function DirectoryFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  resultCount,
}: DirectoryFiltersProps) {
  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Agents' },
    { id: 'elite', label: 'Elite 750+' },
    { id: 'trusted', label: 'Trusted 600+' },
    { id: 'new', label: 'New' },
  ];

  const sortOptions: { id: SortType; label: string }[] = [
    { id: 'score-desc', label: 'Score High → Low' },
    { id: 'recent', label: 'Recently Registered' },
    { id: 'transactions', label: 'Most Transactions' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Input
        placeholder="Search by agent name or address..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full"
      />

      {/* Filter Pills & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all min-h-touch ${
                filter === f.id
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                  : 'bg-gray-900 text-gray-400 hover:text-gray-50 hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm text-gray-400 whitespace-nowrap">
            {resultCount} {resultCount === 1 ? 'agent' : 'agents'}
          </span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortType)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-50 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-600 transition-all min-h-touch cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
