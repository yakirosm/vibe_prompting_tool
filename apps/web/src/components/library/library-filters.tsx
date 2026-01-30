'use client';

import * as React from 'react';
import { Search, Star, X, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AGENT_OPTIONS } from '@prompt-ops/shared';

export type ViewMode = 'grid' | 'list';
export type SortBy = 'created_at' | 'agent_profile_id';
export type SortOrder = 'asc' | 'desc';

export interface LibraryFilters {
  search: string;
  agent: string;
  strategy: string;
  favoritesOnly: boolean;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

interface LibraryFiltersProps {
  filters: LibraryFilters;
  onFiltersChange: (filters: LibraryFilters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function LibraryFiltersBar({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: LibraryFiltersProps) {
  const updateFilter = <K extends keyof LibraryFilters>(
    key: K,
    value: LibraryFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.search ||
    filters.agent ||
    filters.strategy ||
    filters.favoritesOnly;

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      agent: '',
      strategy: '',
      favoritesOnly: false,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and View Mode */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search prompts..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Toggle
            pressed={viewMode === 'grid'}
            onPressedChange={() => onViewModeChange('grid')}
            size="sm"
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={viewMode === 'list'}
            onPressedChange={() => onViewModeChange('list')}
            size="sm"
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Toggle>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-4 flex-wrap">
        <Select
          value={filters.agent || 'all'}
          onValueChange={(v) => updateFilter('agent', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {AGENT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.strategy || 'all'}
          onValueChange={(v) => updateFilter('strategy', v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Strategies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Strategies</SelectItem>
            <SelectItem value="implement">Implement</SelectItem>
            <SelectItem value="diagnose">Diagnose</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(v) => {
            const [sortBy, sortOrder] = v.split('-') as [SortBy, SortOrder];
            onFiltersChange({ ...filters, sortBy, sortOrder });
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest first</SelectItem>
            <SelectItem value="created_at-asc">Oldest first</SelectItem>
            <SelectItem value="agent_profile_id-asc">Agent A-Z</SelectItem>
            <SelectItem value="agent_profile_id-desc">Agent Z-A</SelectItem>
          </SelectContent>
        </Select>

        <Toggle
          pressed={filters.favoritesOnly}
          onPressedChange={(pressed) => updateFilter('favoritesOnly', pressed)}
          aria-label="Show favorites only"
          className="gap-2"
        >
          <Star className="h-4 w-4" />
          Favorites
        </Toggle>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
