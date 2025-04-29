
import { 
  FileText, 
  Scissors, 
  Compass, 
  Eye, 
  File,
  FileImage,
  FileSpreadsheet,
  Presentation,
  FileSignature,
  Shield,
  Layout as LayoutIcon
} from "lucide-react";

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  path: string;
  isPremium: boolean;
}

export const freeTools: Tool[] = [
  {
    id: "merge-basic",
    name: "Fusion de PDF (limité)",
    description: "Combinez jusqu'à 3 fichiers PDF gratuitement.",
    icon: FileText,
    path: "/merge",
    isPremium: false
  },
  {
    id: "view",
    name: "Visualiseur PDF",
    description: "Consultez vos documents PDF en ligne gratuitement.",
    icon: Eye,
    path: "/view",
    isPremium: false
  },
  {
    id: "compress-basic",
    name: "Compression PDF (basique)",
    description: "Réduisez la taille de vos fichiers PDF avec une qualité basique.",
    icon: Compass,
    path: "/compress",
    isPremium: false
  }
];

export const premiumTools: Tool[] = [
  {
    id: "merge-pro",
    name: "Fusion de PDF Pro",
    description: "Combinez un nombre illimité de fichiers PDF et organisez les pages.",
    icon: FileText,
    path: "/merge",
    isPremium: true
  },
  {
    id: "split",
    name: "Division de PDF",
    description: "Divisez un PDF en plusieurs fichiers séparés.",
    icon: Scissors,
    path: "/split",
    isPremium: true
  },
  {
    id: "compress-pro",
    name: "Compression PDF Pro",
    description: "Réduisez la taille de vos fichiers PDF avec des options avancées.",
    icon: Compass,
    path: "/compress",
    isPremium: true
  },
  {
    id: "ocr",
    name: "OCR PDF",
    description: "Convertissez des images PDF en texte éditable.",
    icon: Eye,
    path: "/ocr",
    isPremium: true
  },
  {
    id: "signature",
    name: "Signature PDF",
    description: "Ajoutez des signatures numériques à vos documents PDF.",
    icon: FileSignature,
    path: "/sign-pdf",
    isPremium: true
  },
  {
    id: "edit",
    name: "Édition PDF",
    description: "Modifiez le texte et les images de vos documents PDF.",
    icon: FileText,
    path: "/edit-pdf",
    isPremium: true
  },
  {
    id: "watermark",
    name: "Filigrane PDF",
    description: "Ajoutez un filigrane à vos documents PDF.",
    icon: LayoutIcon,
    path: "/watermark-pdf",
    isPremium: true
  },
  {
    id: "protect",
    name: "Protéger PDF",
    description: "Sécurisez vos PDF avec un mot de passe.",
    icon: Shield,
    path: "/protect-pdf",
    isPremium: true
  },
  {
    id: "organize",
    name: "Organiser PDF",
    description: "Réorganisez les pages de votre PDF.",
    icon: LayoutIcon,
    path: "/organize-pdf",
    isPremium: true
  },
  {
    id: "pdf-to-word",
    name: "PDF en Word",
    description: "Convertissez vos documents PDF en fichiers Word éditables.",
    icon: File,
    path: "/pdf-to-word",
    isPremium: true
  },
  {
    id: "pdf-to-excel",
    name: "PDF en Excel",
    description: "Convertissez vos tableaux PDF en feuilles de calcul Excel.",
    icon: FileSpreadsheet,
    path: "/pdf-to-excel",
    isPremium: true
  },
  {
    id: "pdf-to-powerpoint",
    name: "PDF en PowerPoint",
    description: "Convertissez vos présentations PDF en fichiers PowerPoint.",
    icon: Presentation,
    path: "/pdf-to-powerpoint",
    isPremium: true
  },
  {
    id: "pdf-to-jpg",
    name: "PDF en JPG",
    description: "Convertissez les pages de votre PDF en images JPG.",
    icon: FileImage,
    path: "/pdf-to-jpg",
    isPremium: true
  },
  {
    id: "word-to-pdf",
    name: "Word en PDF",
    description: "Convertissez vos documents Word en PDF de haute qualité.",
    icon: FileText,
    path: "/word-to-pdf",
    isPremium: true
  },
  {
    id: "excel-to-pdf",
    name: "Excel en PDF",
    description: "Convertissez vos feuilles de calcul Excel en PDF.",
    icon: FileText,
    path: "/excel-to-pdf",
    isPremium: true
  },
  {
    id: "powerpoint-to-pdf",
    name: "PowerPoint en PDF",
    description: "Convertissez vos présentations PowerPoint en PDF.",
    icon: FileText,
    path: "/powerpoint-to-pdf",
    isPremium: true
  },
  {
    id: "jpg-to-pdf",
    name: "JPG en PDF",
    description: "Convertissez vos images JPG en documents PDF.",
    icon: FileText,
    path: "/jpg-to-pdf",
    isPremium: true
  }
];
