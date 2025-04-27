
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
}

const FileUploader = ({
  onFilesSelected,
  multiple = false,
  accept = ".pdf",
  maxFiles = 10,
  maxSize = 10
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      // Filter files by accepted types
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const filteredFiles = files.filter((file) => {
        const fileExt = "." + file.name.split(".").pop()?.toLowerCase();
        return acceptedTypes.includes(fileExt) || acceptedTypes.includes("*") || acceptedTypes.includes("*.*") || acceptedTypes.includes(file.type);
      });

      if (filteredFiles.length < files.length) {
        toast({
          title: "Types de fichiers non acceptés",
          description: `Certains fichiers ont été ignorés. Types acceptés: ${accept}`,
          variant: "destructive",
        });
      }

      // Check file size
      const validSizeFiles = filteredFiles.filter((file) => {
        const isValid = file.size <= maxSize * 1024 * 1024;
        if (!isValid) {
          toast({
            title: "Fichier trop volumineux",
            description: `${file.name} dépasse la limite de ${maxSize}MB.`,
            variant: "destructive",
          });
        }
        return isValid;
      });

      // Check number of files
      if (!multiple && validSizeFiles.length > 1) {
        toast({
          title: "Un seul fichier à la fois",
          description: "Vous ne pouvez télécharger qu'un seul fichier à la fois.",
          variant: "destructive",
        });
        return [validSizeFiles[0]];
      }

      if (validSizeFiles.length > maxFiles) {
        toast({
          title: "Trop de fichiers",
          description: `Vous ne pouvez télécharger que ${maxFiles} fichiers à la fois.`,
          variant: "destructive",
        });
        return validSizeFiles.slice(0, maxFiles);
      }

      return validSizeFiles;
    },
    [accept, maxFiles, maxSize, multiple, toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = validateFiles(droppedFiles);
        
        if (validFiles.length > 0) {
          onFilesSelected(validFiles);
        }
      }
    },
    [onFilesSelected, validateFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = validateFiles(selectedFiles);
        
        if (validFiles.length > 0) {
          onFilesSelected(validFiles);
        }
      }
      // Reset file input value to allow selecting the same files again
      e.target.value = "";
    },
    [onFilesSelected, validateFiles]
  );

  return (
    <div
      className={`file-drop-area ${isDragging ? "active" : ""}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <Upload className="h-12 w-12 mx-auto text-pdf-primary mb-4" />
        <h3 className="text-lg font-medium mb-2">
          Déposez vos fichiers PDF ici
        </h3>
        <p className="text-gray-500 mb-4">
          ou
        </p>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button type="button">
            Choisir des fichiers
          </Button>
        </label>
        <p className="text-xs text-gray-500 mt-4">
          {multiple
            ? `Vous pouvez télécharger jusqu'à ${maxFiles} fichiers (${maxSize}MB max chacun)`
            : `Taille maximale de fichier: ${maxSize}MB`}
        </p>
      </div>
    </div>
  );
};

export default FileUploader;
