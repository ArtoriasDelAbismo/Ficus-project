import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-sign" style={{height:'282px'}}>
        <h1 className="home-title">Ficus View</h1>

        <p className="home-description">
          Diseña y ajusta tus muebles a medida de manera fácil e intuitiva,
          optimizando cada rincón de tu hogar.
        </p>
        <Link to="/configurador" className="configurator-link">
          Ir al Configurador
        </Link>

      </div>
    </div>
  );
}
