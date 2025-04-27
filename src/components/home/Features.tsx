
import { Shield, Zap, Lock } from "lucide-react";

const features = [
  {
    title: "Sécurité Complète",
    description:
      "Vos fichiers sont traités localement dans votre navigateur et ne sont jamais téléchargés sur nos serveurs.",
    icon: <Shield className="h-8 w-8 text-pdf-primary" />,
  },
  {
    title: "Super Rapide",
    description:
      "Tous nos outils sont optimisés pour vous donner des résultats instantanés, même sur des fichiers volumineux.",
    icon: <Zap className="h-8 w-8 text-pdf-primary" />,
  },
  {
    title: "Haute Qualité",
    description:
      "Nos algorithmes préservent la qualité de vos documents tout en les optimisant.",
    icon: <Lock className="h-8 w-8 text-pdf-primary" />,
  },
];

const Features = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="container">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Pourquoi choisir Petite PDF Magic?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
