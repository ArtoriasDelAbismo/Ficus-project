import { memo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import "./Configurador.css";
import { useConfigurador } from "./useConfigurador";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import { RiWindowsLine } from "react-icons/ri";
import { BsDoorOpenFill } from "react-icons/bs";

const Draggable = ({ children, onDrag, initialPosition = [0, 0, 0], onClick, rotation = [0, 0, 0] }) => {
  const [pos, setPos] = useState(initialPosition);

  useEffect(() => {
    setPos(initialPosition);
  }, [initialPosition]);

  const bind = useDrag(({ offset: [x, y, z] }) => {
    const newPos = [x, y, z];
    setPos(newPos);
    onDrag(newPos);
  });

  return (
    <group position={pos} {...bind()} onClick={onClick} rotation={rotation}>
      {children}
    </group>
  );
};

const Scene = memo(({ espacio, modulos, setModulos, openings, setOpenings, setSelectedOpening, selectedOpening }) => {
  const handleModuleDrag = (moduleId, newPosition) => {
    setModulos((prevModulos) =>
      prevModulos.map((m) =>
        m.id === moduleId ? { ...m, position: newPosition } : m
      )
    );
  };

  const handleOpeningDrag = (openingId, newPosition) => {
    setOpenings((prevOpenings) =>
      prevOpenings.map((o) =>
        o.id === openingId ? { ...o, position: newPosition } : o
      )
    );
  };

  return (
    <Canvas camera={{ position: [0, 300, 500], fov: 50, near: 0.1, far: 10000 }} style={{width:'100vw'}}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[0, 500, 500]} intensity={1.2} />
      <OrbitControls />

      {/* Plano del suelo y paredes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[espacio.ancho / 2, 0, espacio.largo / 2]}>
        <planeGeometry args={[espacio.ancho, espacio.largo]} />
        <meshStandardMaterial color="lightgray" />
      </mesh>
      <Box args={[espacio.ancho, espacio.alto, 1]} position={[espacio.ancho / 2, espacio.alto / 2, 0]}>
        <meshStandardMaterial color="lightblue" opacity={0.5} transparent />
      </Box>
      <Box args={[1, espacio.alto, espacio.largo]} position={[0, espacio.alto / 2, espacio.largo / 2]}>
        <meshStandardMaterial color="lightblue" opacity={0.5} transparent />
      </Box>

      {/* Cubos representando módulos */}
      {modulos.map((modulo) => (
        <Draggable key={modulo.id} onDrag={(newPos) => handleModuleDrag(modulo.id, newPos)} initialPosition={modulo.position}>
          <Box args={[modulo.ancho, modulo.alto, modulo.profundidad]}>
            <meshStandardMaterial color="white" />
          </Box>
        </Draggable>
      ))}
      
      {/* Renderizar aberturas */}
      {openings.map((opening) => (
        <Draggable 
          key={opening.id} 
          onDrag={(newPos) => handleOpeningDrag(opening.id, newPos)} 
          initialPosition={opening.position}
          onClick={() => setSelectedOpening(opening)}
          rotation={opening.pared === 'izquierda' || opening.pared === 'derecha' ? [0, Math.PI / 2, 0] : [0, 0, 0]}
        >
          <Box args={opening.args}>
            <meshStandardMaterial color={selectedOpening?.id === opening.id ? 'red' : (opening.type === 'door' ? 'brown' : 'blue')} />
          </Box>
        </Draggable>
      ))}
    </Canvas>
  );
});
Scene.displayName = 'Scene';

function Configurador() {
  const {
    modulos,
    setModulos,
    espacio,
    handleInputChange,
    openings,
    setOpenings,
    selectedOpening,
    setSelectedOpening,
    addOpening,
    handleOpeningPositionChange,
    removeOpening,
  } = useConfigurador();
  const [openingsOpenState, setOpeningsOpenState] = useState({});

  const toggleOpening = (openingId) => {
    setOpeningsOpenState(prevState => ({
      ...prevState,
      [openingId]: !prevState[openingId]
    }));
  };

  return (
    <div className="configurador-container">
      {/* Panel lateral */}
      <div className="panel-lateral">
        <div style={{ width:'100%', display:'flex', justifyContent:'center', gap:'5px', marginBottom:'62px', marginTop:'12px'}}>
          <img style={{width:'90px', height:'50px'}} src="assets/images/cropped-2-e1745241876834.webp" alt="" />
          <p>view</p>
        </div>
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

        <h2>Aberturas</h2>
        <div style={{width:'100%', display:'flex', justifyContent:'center', gap:'12px'}}>
          <button onClick={() => addOpening('door')}><BsDoorOpenFill /></button>
          <button onClick={() => addOpening('window')}><RiWindowsLine /></button>

        </div>

        {openings.map(opening => (
          <div className="openings-control-container" key={opening.id}>
            <div style={{cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center'}} onClick={() => toggleOpening(opening.id)}>
            <h3 style={{margin:'0'}} onClick={(e) => {e.stopPropagation(); setSelectedOpening(opening)}}>{opening.type === 'door' ? 'Puerta' : 'Ventana'} {opening.displayId}</h3>
              {openingsOpenState[opening.id] ? <IoIosArrowUp /> : <IoIosArrowDown /> }
            </div>
          {openingsOpenState[opening.id] && (
            <div className={selectedOpening?.id === opening.id ? 'opening-controls selected' : 'opening-controls'}>
              <label>
                Pared:
                <select name="pared" value={opening.pared} onChange={(e) => handleOpeningPositionChange(e, opening.id)}>
                  <option value="frontal">Frontal</option>
                  <option value="trasera">Trasera</option>
                  <option value="izquierda">Izquierda</option>
                  <option value="derecha">Derecha</option>
                </select>
              </label>
              <div style={{width:'100%', height:'1px', backgroundColor:'#bbbbbb', marginTop:'14px'}}></div>
              <br />
              <label>
                Distancia desde la pared (cm):
                <input 
                  type="number" 
                  name="distanciaDesdePared" 
                  value={opening.distanciaDesdePared} 
                  onChange={(e) => handleOpeningPositionChange(e, opening.id)} 
                />
              </label>
                            <div style={{width:'100%', height:'1px', backgroundColor:'#bbbbbb', marginTop:'14px'}}></div>

              {opening.type !== 'door' && (
                <>
                  <br />
                  <label>
                    Distancia desde el suelo (cm):
                    <input 
                      type="number" 
                      name="distanciaDesdeSuelo" 
                      value={opening.distanciaDesdeSuelo} 
                      onChange={(e) => handleOpeningPositionChange(e, opening.id)} 
                    />
                  </label>
                                              <div style={{width:'100%', height:'1px', backgroundColor:'#bbbbbb', marginTop:'14px'}}></div>

                </>
              )}
              <div style={{display:'flex', justifyContent:'end', marginTop:'10px'}}>
                <button onClick={() => removeOpening(opening.id)}>
                  <FaTrash />
                </button>

              </div>
            </div>

          )}

          </div>
        ))}
      </div>

      {/* Área de visualización 3D */}
      <div className="visualizacion-3d">
        <Scene 
          espacio={espacio} 
          modulos={modulos} 
          setModulos={setModulos} 
          openings={openings} 
          setOpenings={setOpenings} 
          setSelectedOpening={setSelectedOpening}
          selectedOpening={selectedOpening}
        />
      </div>
    </div>
  );
}

export default Configurador;