import "./Footer.css"
import { Link } from "react-router-dom"
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react"
import logo from "../../assets/images/logo.png"

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container">
        <div className="footer-content">
          <div className="footer-column footer-brand">
            <Link to="/" className="footer-logo">
              <img src={logo} alt="Dally Nettoyage" />
            </Link>
            <p className="footer-tagline">
              Service de nettoyage professionnel pour particuliers et entreprises en Suisse romande
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Navigation</h4>
            <ul>
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/services">Nos services</Link></li>
              <li><Link to="/tarifs">Tarifs</Link></li>
              <li><Link to="/a-propos">À propos</Link></li>
              <li><Link to="/testimonials">Témoignages</Link></li>
              <li><Link to="/booking">Réserver</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Services</h4>
            <ul>
              <li><Link to="/services/nettoyage-voiture">Nettoyage voiture</Link></li>
              <li><Link to="/services/nettoyage-domicile">Nettoyage domicile</Link></li>
              <li><Link to="/services/nettoyage-bureau">Nettoyage bureau</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <ul className="footer-contact">
              <li>
                <Phone size={16} />
                <a href="tel:+41783239711">078 323 97 11</a>
              </li>
              <li>
                <Mail size={16} />
                <a href="mailto:contact@dally-nettoyage.ch">contact@dally-nettoyage.ch</a>
              </li>
              <li>
                <MapPin size={16} />
                <span>Genève & Vaud, Suisse</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Dally Nettoyage. Tous droits réservés.
          </p>
          <div className="footer-legal">
            <Link to="/mentions-legales">Mentions légales</Link>
            <Link to="/politique-confidentialite">Confidentialité</Link>
            <Link to="/cgv">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer