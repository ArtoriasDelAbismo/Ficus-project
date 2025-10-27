import { useEffect, useRef, useState } from "react";
import { memo } from "react";
import { Draggable } from "./Draggable";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Edges } from '@react-three/drei';

export const Scene = memo(
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
