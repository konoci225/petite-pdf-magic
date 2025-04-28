
import React from "react";
import { Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportFiltersProps {
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  onRefresh: () => void;
}

export const ReportFilters = ({ 
  timeframe, 
  onTimeframeChange,
  onRefresh 
}: ReportFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
      <Select 
        value={timeframe}
        onValueChange={onTimeframeChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sélectionner une période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">7 derniers jours</SelectItem>
          <SelectItem value="month">30 derniers jours</SelectItem>
          <SelectItem value="quarter">3 derniers mois</SelectItem>
          <SelectItem value="year">Année en cours</SelectItem>
          <SelectItem value="all">Toutes les données</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
        <Button size="sm" variant="outline" onClick={onRefresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
    </div>
  );
};
