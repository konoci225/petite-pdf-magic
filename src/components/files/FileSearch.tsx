
import React from "react";
import { Search, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileSearchProps {
  searchTerm: string;
  fileTypeFilter: string;
  onSearchChange: (value: string) => void;
  onFileTypeChange: (value: string) => void;
  onRefresh: () => void;
}

export const FileSearch = ({
  searchTerm,
  fileTypeFilter,
  onSearchChange,
  onFileTypeChange,
  onRefresh
}: FileSearchProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un fichier ou un utilisateur..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Select 
          value={fileTypeFilter}
          onValueChange={onFileTypeChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type de fichier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="docx">DOCX</SelectItem>
            <SelectItem value="xlsx">XLSX</SelectItem>
            <SelectItem value="pptx">PPTX</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={onRefresh}>
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
