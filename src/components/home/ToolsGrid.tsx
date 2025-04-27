
import ToolCard from "../tools/ToolCard";
import { Merge, Scissors, FileImage, FileText } from "lucide-react";

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
    title: "PDF en texte",
    description: "Extraire le texte de votre document PDF.",
    icon: <FileText className="h-6 w-6 text-white" />,
    to: "/extract-text",
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
