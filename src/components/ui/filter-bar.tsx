// src/components/ui/filter-bar.tsx
import { FC } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface FilterOption {
  value: string;
  label: string;
}

interface DropdownFilter {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: FilterOption[];
  widthClass?: string;
}

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchClear?: () => void; // Callback để fetch lại dữ liệu khi clear
  filters: DropdownFilter[];
}

const FilterBar: FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  onSearchClear,
  filters,
}) => {
  const handleClear = () => {
    onSearchChange("");
    // Gọi callback để fetch lại dữ liệu với keyword rỗng
    if (onSearchClear) {
      onSearchClear();
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        {/* Enhanced Search box - takes more space */}
        <div className="flex-1 lg:flex-[2]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã số, hoặc từ khóa..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-12 py-3 text-base border-2 border-gray-200 hover:border-gray-300 focus:border-blue-500 transition-colors duration-200 rounded-lg shadow-sm"
            />
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100 rounded-full"
                title="Xóa tìm kiếm"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </Button>
            )}
          </div>
        </div>

        {/* Compact filters section */}
        <div className="flex items-center gap-3 lg:flex-shrink-0">
          {filters.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Lọc</span>
            </div>
          )}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {filters.map((filter, idx) => (
              <Select
                key={idx}
                value={filter.value}
                onValueChange={filter.onChange}
              >
                <SelectTrigger
                  className={`${
                    filter.widthClass || "w-36"
                  } border-2 border-gray-200 hover:border-gray-300 focus:border-blue-500 transition-colors duration-200`}
                >
                  <SelectValue placeholder={filter.placeholder || "Chọn"} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
