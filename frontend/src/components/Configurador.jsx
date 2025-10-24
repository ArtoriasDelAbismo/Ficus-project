import { memo, useState, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Box, Edges } from "@react-three/drei";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import "./Configurador.css";
import { useConfigurador } from "./useConfigurador";
import { FaTrash } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { RiWindowsLine } from "react-icons/ri";
import { BsDoorOpenFill } from "react-icons/bs";
import { CgArrowAlignH } from "react-icons/cg";
import { CgArrowAlignV } from "react-icons/cg";

const Draggable = ({
  children,
  onDrag,
  initialPosition = [0, 0, 0],
  setIsDragging,
  wall,
  espacio,
  rotation = [0, 0, 0],
  size = [50, 50, 50],
}) => {
  const { camera } = useThree();
  const [pos, setPos] = useState(initialPosition);
  const wallRef = useRef(wall);

  useEffect(() => {
    setPos(initialPosition);
    wallRef.current = wall;
  }, [initialPosition, wall]);

  const bind = useDrag(
    ({ event, movement: [mx, my], memo, first, last, ctrlKey }) => {
      event.stopPropagation();
      if (first) {
        setIsDragging?.(true);
      }
      if (!memo) memo = pos;

      const dragScale = 0.5;
      let newX = memo[0];
      let newY = memo[1];
      let newZ = memo[2];

      if (ctrlKey) {
        newY = memo[1] - my * dragScale;
      } else {
        const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(
          camera.quaternion
        );
        cameraRight.y = 0;

        if (wallRef.current === "left" || wallRef.current === "right") {
          newX = memo[0];
          newZ = memo[2] + mx * dragScale * cameraRight.z;
        } else if (wallRef.current === "front" || wallRef.current === "back") {
          newX = memo[0] + mx * dragScale * cameraRight.x;
          newZ = memo[2];
        } else {
          const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(
            camera.quaternion
          );
          forwardVector.y = 0;
          forwardVector.normalize();
          cameraRight.normalize();

          newX =
            memo[0] +
            (cameraRight.x * mx - forwardVector.x * my) * dragScale;
          newZ =
            memo[2] +
            (cameraRight.z * mx - forwardVector.z * my) * dragScale;
        }

        const snapThreshold = 30;

        if (!wallRef.current) {
          if (newX < snapThreshold) wallRef.current = "left";
          else if (espacio && newX > espacio.ancho - snapThreshold)
            wallRef.current = "right";
          else if (newZ < snapThreshold) wallRef.current = "front";
          else if (espacio && newZ > espacio.largo - snapThreshold)
            wallRef.current = "back";
        }

        if (wallRef.current === "left") newX = 0;
        else if (wallRef.current === "right" && espacio) newX = espacio.ancho;
        else if (wallRef.current === "front") newZ = 0;
        else if (wallRef.current === "back" && espacio) newZ = espacio.largo;
      }

      const [width, height, depth] = size;
      newX = Math.max(
        width / 2,
        Math.min(newX, espacio.ancho - width / 2)
      );
      newY = Math.max(
        height / 2,
        Math.min(newY, espacio.alto - height / 2)
      );
      newZ = Math.max(
        depth / 2,
        Math.min(newZ, espacio.largo - depth / 2)
      );

      const newPos = [newX, newY, newZ];
      setPos(newPos);
      onDrag(newPos);

      if (last) {
        setIsDragging?.(false);
      }
      return memo;
    },
    { pointerEvents: true }
  );

  return (
    <group position={pos} {...bind()} cursor="grab" rotation={rotation}>
      {children}
    </group>
  );
};

const Scene = memo(
  ({
    espacio,
    modulos,
    setModulos,
    openings,
    setOpenings,
    setSelectedOpening,
    selectedOpening,
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const controlsRef = useRef();

    // Disable orbit when dragging
    useEffect(() => {
      if (controlsRef.current) controlsRef.current.enabled = !isDragging;
    }, [isDragging]);

    const getRotationFromWall = (wall) => {
      switch (wall) {
        case "trasera":
          return [0, Math.PI, 0];
        case "izquierda":
          return [0, Math.PI / 2, 0];
        case "derecha":
          return [0, -Math.PI / 2, 0];
        case "frontal":
        default:
          return [0, 0, 0];
      }
    };

    const handleModuleDrag = (moduleId, newPosition) => {
      setModulos((prev) =>
        prev.map((m) =>
          m.id === moduleId ? { ...m, position: newPosition } : m
        )
      );
    };

    const handleOpeningDrag = (openingId, newPosition) => {
      setOpenings((prev) =>
        prev.map((o) => {
          if (o.id === openingId) {
            const updatedOpening = { ...o, position: newPosition };
            const [newX, newY, newZ] = newPosition;

            if (updatedOpening.type !== "door") {
              updatedOpening.distanciaDesdeSuelo = Math.max(
                0,
                newY - updatedOpening.args[1] / 2
              );
            }

            switch (updatedOpening.pared) {
              case "frontal":
              case "trasera":
                updatedOpening.distanciaDesdePared = newX;
                break;
              case "izquierda":
              case "derecha":
                updatedOpening.distanciaDesdePared = newZ;
                break;
              default:
                break;
            }
            return updatedOpening;
          }
          return o;
        })
      );
    };

    const wallMapping = {
      frontal: "front",
      trasera: "back",
      izquierda: "left",
      derecha: "right",
    };

    return (
      <Canvas
        camera={{ position: [0, 300, 600], fov: 50, near: 0.1, far: 10000 }}
        style={{ width: "100vw", height: "100%" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 500, 500]} intensity={1.2} />
        <OrbitControls ref={controlsRef} />

        {/* Floor and walls */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[espacio.ancho / 2, 0, espacio.largo / 2]}
        >
          <planeGeometry args={[espacio.ancho, espacio.largo]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>
        <Box
          args={[espacio.ancho, espacio.alto, 1]}
          position={[espacio.ancho / 2, espacio.alto / 2, 0]}
        >
          <meshStandardMaterial color="lightblue" opacity={0.5} transparent />
        </Box>
        <Box
          args={[1, espacio.alto, espacio.largo]}
          position={[0, espacio.alto / 2, espacio.largo / 2]}
        >
          <meshStandardMaterial color="lightblue" opacity={0.5} transparent />
        </Box>

        {/* Modules */}
        {modulos.map((modulo) => (
          <Draggable
            key={modulo.id}
            initialPosition={modulo.position}
            onDrag={(newPos) => handleModuleDrag(modulo.id, newPos)}
            setIsDragging={setIsDragging}
            wall={modulo.wall}
            espacio={espacio}
            size={[modulo.ancho, modulo.alto, modulo.profundidad]}
          >
            <Box args={[modulo.ancho, modulo.alto, modulo.profundidad]}>
              <meshStandardMaterial color="white" />
              <Edges />
            </Box>
          </Draggable>
        ))}

        {/* Openings */}
        {openings.map((opening) => (
          <Draggable
            key={opening.id}
            initialPosition={opening.position}
            onDrag={(newPos) => handleOpeningDrag(opening.id, newPos)}
            setIsDragging={setIsDragging}
            onClick={() => setSelectedOpening(opening)}
            rotation={getRotationFromWall(opening.pared)}
            espacio={espacio}
            wall={wallMapping[opening.pared]}
            size={opening.args}
          >
            <Box args={opening.args}>
              <meshStandardMaterial
                color={
                  selectedOpening?.id === opening.id
                    ? "red"
                    : opening.type === "door"
                    ? "brown"
                    : "blue"
                }
              />
            </Box>
          </Draggable>
        ))}
      </Canvas>
    );
  }
);
Scene.displayName = "Scene";

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
    setOpeningsOpenState((prev) => ({
      ...prev,
      [openingId]: !prev[openingId],
    }));
  };

  return (
    <div className="configurador-container">
      {/* Panel lateral */}
      <div className="panel-lateral">
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "5px",
            marginBottom: "62px",
            marginTop: "12px",
          }}
        >
          <img
            style={{ width: "90px", height: "50px" }}
            src="assets/images/cropped-2-e1745241876834.webp"
            alt=""
          />
          <p>view</p>
        </div>

        <h2>Medidas del espacio</h2>
        <label>
          Ancho (cm):
          <input
            type="number"
            name="ancho"
            value={espacio.ancho}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Largo (cm):
          <input
            type="number"
            name="largo"
            value={espacio.largo}
            onChange={handleInputChange}
          />
        </label>
        <br />
        <label>
          Alto (cm):
          <input
            type="number"
            name="alto"
            value={espacio.alto}
            onChange={handleInputChange}
          />
        </label>

        <h2>Módulos disponibles</h2>
        <ul>
          {modulos.map((modulo) => (
            <li key={modulo.id}>
              {modulo.id} - {modulo.tipo} ({modulo.ancho}x{modulo.alto}x
              {modulo.profundidad})
            </li>
          ))}
        </ul>

        <h2>Aberturas</h2>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button onClick={() => addOpening("door")}>
            <BsDoorOpenFill />
          </button>
          <button onClick={() => addOpening("window")}>
            <RiWindowsLine />
          </button>
        </div>

        {openings.map((opening) => (
          <div className="openings-control-container" key={opening.id}>
            <div
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onClick={() => toggleOpening(opening.id)}
            >
              <h3
                style={{ margin: "0" }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOpening(opening);
                }}
              >
                {opening.type === "door" ? "Puerta" : "Ventana"}{" "}
                {opening.displayId}
              </h3>
              {openingsOpenState[opening.id] ? (
                <IoIosArrowUp />
              ) : (
                <IoIosArrowDown />
              )}
            </div>
            {openingsOpenState[opening.id] && (
              <div
                className={
                  selectedOpening?.id === opening.id
                    ? "opening-controls selected"
                    : "opening-controls"
                }
              >
                <label>
                  Pared:
                  <select
                    name="pared"
                    value={opening.pared}
                    onChange={(e) => handleOpeningPositionChange(e, opening.id)}
                  >
                    <option value="frontal">Frontal</option>
                    <option value="trasera">Trasera</option>
                    <option value="izquierda">Izquierda</option>
                    <option value="derecha">Derecha</option>
                  </select>
                </label>
                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    backgroundColor: "#bbbbbb",
                    marginTop: "14px",
                  }}
                ></div>
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
                <div
                  style={{
                    width: "100%",
                    height: "1px",
                    backgroundColor: "#bbbbbb",
                    marginTop: "14px",
                  }}
                ></div>

                {opening.type !== "door" && (
                  <>
                    <br />
                    <label>
                      Distancia desde el suelo (cm):
                      <input
                        type="number"
                        name="distanciaDesdeSuelo"
                        value={opening.distanciaDesdeSuelo}
                        onChange={(e) =>
                          handleOpeningPositionChange(e, opening.id)
                        }
                      />
                    </label>
                    <div
                      style={{
                        width: "100%",
                        height: "1px",
                        backgroundColor: "#bbbbbb",
                        marginTop: "14px",
                      }}
                    ></div>
                  </>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "end",
                    marginTop: "10px",
                  }}
                >
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
