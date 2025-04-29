import ToolCard from "../tools/ToolCard";
import { Merge, Scissors, FileImage, FileText, File, FileSpreadsheet, Presentation } from "lucide-react";

const tools = [
  {
    title: "Fusionner des PDFs",
    description: "Combinez plusieurs fichiers PDF en un seul document.",
    icon: <Merge className="h-6 w-6 text-white" />,
    to: "/merge",
    color: "bg-pdf-primary",
  },
  {
    title: "Diviser un PDF",
    description: "Séparez votre PDF en plusieurs fichiers.",
    icon: <Scissors className="h-6 w-6 text-white" />,
    to: "/split",
    color: "bg-pdf-secondary",
  },
  {
    title: "Compresser PDF",
    description: "Réduisez la taille de votre fichier PDF.",
    icon: <FileImage className="h-6 w-6 text-white" />,
    to: "/compress",
    color: "bg-green-500",
  },
  {
    title: "PDF en Word",
    description: "Convertissez un PDF en document Word éditable.",
    icon: <File className="h-6 w-6 text-white" />,
    to: "/pdf-to-word",
    color: "bg-blue-500",
  },
  {
    title: "PDF en Excel",
    description: "Convertissez un PDF en feuille de calcul Excel.",
    icon: <FileSpreadsheet className="h-6 w-6 text-white" />,
    to: "/pdf-to-excel",
    color: "bg-green-600",
  },
  {
    title: "PDF en JPG",
    description: "Convertissez un PDF en images JPG.",
    icon: <FileImage className="h-6 w-6 text-white" />,
    to: "/pdf-to-jpg",
    color: "bg-purple-500",
  },
  {
    title: "Word en PDF",
    description: "Convertissez un document Word en PDF.",
    icon: <FileText className="h-6 w-6 text-white" />,
    to: "/word-to-pdf",
    color: "bg-red-500",
  },
  {
    title: "JPG en PDF",
    description: "Créez un PDF à partir d'images JPG.",
    icon: <FileText className="h-6 w-6 text-white" />,
    to: "/jpg-to-pdf",
    color: "bg-amber-500",
  },
];

const ToolsGrid = () => {
  return (
    <div className="py-12 container">
      <h2 className="text-3xl font-bold mb-8 text-center">Nos Outils PDF</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.title}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            to={tool.to}
            color={tool.color}
          />
        ))}
      </div>
    </div>
  );
};

export default ToolsGrid;
