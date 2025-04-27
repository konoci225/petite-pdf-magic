
import { useState, useEffect } from "react";
import { FileText, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileItemProps {
  file: File;
  onRemove: () => void;
  showRemove?: boolean;
}

const FileItem = ({ file, onRemove, showRemove = true }: FileItemProps) => {
  const [fileSize, setFileSize] = useState<string>("");

  useEffect(() => {
    const size = file.size;
    if (size < 1024) {
      setFileSize(`${size} B`);
    } else if (size < 1024 * 1024) {
      setFileSize(`${(size / 1024).toFixed(1)} KB`);
    } else {
      setFileSize(`${(size / (1024 * 1024)).toFixed(1)} MB`);
    }
  }, [file]);

  return (
    <div className="flex items-center p-3 rounded-md border bg-white">
      <div className="w-10 h-10 rounded-md bg-pdf-secondary/10 flex items-center justify-center mr-3">
        <FileText className="h-5 w-5 text-pdf-secondary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{fileSize}</p>
      </div>
      <div className="flex items-center">
        <Check className="h-5 w-5 text-green-500 mr-2" />
        {showRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-700"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FileItem;
