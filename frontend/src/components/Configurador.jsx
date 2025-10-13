import { useState, useEffect, memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const Scene = memo(({ espacio, modulos }) => {
  return (
    <Canvas camera={{ position: [0, 300, 500], fov: 50 }} style={{width:'100vw'}}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 500, 500]} intensity={0.8} />
      <OrbitControls />

      {/* Cubo representando el espacio */}
      <mesh position={[espacio.ancho / 2, espacio.alto / 2, espacio.largo / 2]}>
        <boxGeometry args={[espacio.ancho, espacio.alto, espacio.largo]} />
        <meshStandardMaterial color="lightblue" opacity={0.2} transparent />
      </mesh>

      {/* Cubos representando módulos */}
      {modulos.map((modulo, index) => (
        <mesh
          key={modulo.id}
          position={[modulo.ancho / 2 + index * 10, modulo.alto / 2, modulo.profundidad / 2]}
        >
          <boxGeometry args={[modulo.ancho, modulo.alto, modulo.profundidad]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      ))}
    </Canvas>
  );
});
Scene.displayName = 'Scene';

export default function Configurador() {
  const [modulos, setModulos] = useState([]);
  const [espacio, setEspacio] = useState({ ancho: 300, largo: 300, alto: 250 }); // valores por defecto en cm

  // Traer módulos desde el backend
  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/modulos");
        const data = await response.json();
        setModulos(data);
      } catch (error) {
        console.error("Error fetching modulos", error);
      }
    };
    fetchModulos();
  }, []);

  // Manejar cambio de medidas del espacio
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEspacio((prevEspacio) => ({ ...prevEspacio, [name]: Number(value) }));
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Panel lateral */}
      <div style={{ width: "300px", padding: "1rem", backgroundColor: "#f5f5f5", color:'black' }}>
        <h2>Medidas del espacio</h2>
        <label>
          Ancho (cm):
          <input type="number" name="ancho" value={espacio.ancho} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Largo (cm):
          <input type="number" name="largo" value={espacio.largo} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Alto (cm):
          <input type="number" name="alto" value={espacio.alto} onChange={handleInputChange} />
        </label>

        <h2>Módulos disponibles</h2>
        <ul>
          {modulos.map((modulo) => (
            <li key={modulo.id}>
              {modulo.id} - {modulo.tipo} ({modulo.ancho}x{modulo.alto}x{modulo.profundidad})
            </li>
          ))}
        </ul>
      </div>

      {/* Área de visualización 3D */}
      <div style={{ flexGrow: 1 }}>
        <Scene espacio={espacio} modulos={modulos} />
      </div>
    </div>
  );
}
