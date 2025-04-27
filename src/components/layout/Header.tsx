
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="w-full bg-white shadow-sm py-4">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pdf-primary to-pdf-secondary flex items-center justify-center">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-xl font-bold text-pdf-dark">Petite PDF Magic</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-pdf-dark hover:text-pdf-primary transition-colors">
            Accueil
          </Link>
          <Link to="/tools" className="text-pdf-dark hover:text-pdf-primary transition-colors">
            Outils
          </Link>
          <Link to="/about" className="text-pdf-dark hover:text-pdf-primary transition-colors">
            À propos
          </Link>
        </nav>
        <Button className="bg-pdf-primary hover:bg-pdf-accent">
          Commencer
        </Button>
      </div>
    </header>
  );
};

export default Header;
