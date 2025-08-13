import { FC } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
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
  filters: DropdownFilter[];
}

const FilterBar: FC<FilterBarProps> = ({ searchTerm, onSearchChange, filters }) => {
  return (
    <CardContent className="pt-0">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search box */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center gap-2">
          {filters.length > 0 && <Filter className="h-4 w-4 text-muted-foreground" />}
          {filters.map((filter, idx) => (
            <Select key={idx} value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className={filter.widthClass || "w-32"}>
                <SelectValue placeholder={filter.placeholder || "Select"} />
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
    </CardContent>
  );
};

export default FilterBar;
