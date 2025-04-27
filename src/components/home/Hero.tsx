
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="py-12 md:py-20 bg-gradient-to-br from-pdf-primary/10 to-pdf-secondary/10">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Transformez vos PDFs <span className="text-pdf-primary">facilement</span> et <span className="text-pdf-secondary">rapidement</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Modifiez, convertissez et organisez vos documents PDF en quelques clics. Des outils simples, puissants et gratuits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-pdf-primary hover:bg-pdf-accent text-white px-8 py-6">
              <Link to="/tools">Voir tous les outils</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white">
              <Link to="/merge">Fusionner des PDFs</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
