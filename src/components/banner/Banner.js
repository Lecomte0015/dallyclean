import React from "react"
import { Link } from "react-router-dom"
import "./Banner.css"
import "./Banner.override.css"
import banner1 from "../../assets/images/banner1.png"
import {  ArrowRight } from "lucide-react"

const Banner = () => {
  return (
    <div className="banner-container">
      <div className="banner-content">
        

        <div className="banner-heading">
          <h1>Un nettoyage à la perfection à votre domicile</h1>
        </div>

        <div className="banner-subheading">
          <p>Des services de nettoyage résidentiel et commercial fiables et abordables pour un environnement impeccable</p>
        </div>

        <div className="banner-buttons">
          <Link to="/booking" className="btn btn-primary btn-lg banner-cta-primary">
            Obtenez un devis gratuit
            <ArrowRight size={20} />
          </Link>
          <Link to="/services" className="btn btn-outline btn-lg banner-cta-secondary">
            Nos services
          </Link>
        </div>
      </div>

      <div className="banner-image">
        <div className="banner-image-wrapper">
          <img src={banner1} alt="Service de nettoyage professionnel Dally" />
        </div>
      </div>
    </div>
  )
}

export default Banner