import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:'10px'}}>
            <img src="/assets/images/cropped-2-e1745241876834.webp" alt="" className="logo-image"/>
            <h1 className="home-title">View</h1>

        </div>
      <p className="home-description">
        Diseña y ajusta tus muebles a medida de manera fácil e intuitiva, optimizando cada rincón de tu hogar.
      </p>
      <Link to="/configurador" className="configurator-link">
        Ir al Configurador
      </Link>
    </div>
  );
}
