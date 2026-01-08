import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { categories } from '../data/mockTenders';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategories: string[];
  onCategoryToggle: (code: string) => void;
  onClearFilters: () => void;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategories,
  onCategoryToggle,
  onClearFilters,
}: SearchFilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by quotation, summary, ministry, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-input-background border-border h-11"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 h-11 px-4">
              <SlidersHorizontal className="h-4 w-4" />
              Categories
              {selectedCategories.length > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {selectedCategories.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category.code}
                checked={selectedCategories.includes(category.code)}
                onCheckedChange={() => onCategoryToggle(category.code)}
              >
                <span className="font-mono text-xs mr-2">{category.code}</span>
                <span className="text-sm">{category.name}</span>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedCategories.map((code) => {
            const category = categories.find((c) => c.code === code);
            return (
              <Badge
                key={code}
                variant="secondary"
                className="gap-1.5 pl-2 pr-1.5 py-1"
              >
                <span className="font-mono text-xs">{code}</span>
                <span className="text-xs">- {category?.name}</span>
                <button
                  onClick={() => onCategoryToggle(code)}
                  className="ml-1 rounded-sm hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
