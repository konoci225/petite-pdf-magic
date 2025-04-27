
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t py-8 mt-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Petite PDF Magic</h3>
            <p className="text-gray-600">
              Des outils simples pour travailler avec vos PDFs, facilement et rapidement.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-pdf-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-gray-600 hover:text-pdf-primary transition-colors">
                  Tous les outils
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-pdf-primary transition-colors">
                  À propos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-600">
              Des questions ou des suggestions? Contactez-nous à support@petitepdfmagic.com
            </p>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Petite PDF Magic. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
