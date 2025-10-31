import { useEffect, useRef, useState } from "react";
import { memo } from "react";
import { DraggableWallObject } from "./DraggableWallObject";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Box, Edges, useTexture } from "@react-three/drei";
import * as THREE from "three";

const Wall = ({ textureMaps, scale, ...props }) => {
  const { color, displacement, normal, roughness } = useTexture({
    color: textureMaps.color,
    displacement: textureMaps.displacement,
    normal: textureMaps.normal,
    roughness: textureMaps.roughness,
  });

  [color, displacement, normal].forEach((texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / scale, 1 / scale);
  });

  return (
    <Box {...props}>
      <meshStandardMaterial
        map={color}
        displacementMap={displacement}
        normalMap={normal}
        roughnessMap={roughness}
      />
    </Box>
  );
};

export const Scene = memo(
  ({
    espacio,
    placedModules,
    setPlacedModules,
    openings,
    setOpenings,
    setSelectedObject,
    selectedObject,
    wallTexture,
    textureScale,
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
      setPlacedModules((prev) =>
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

    const getAABB = (obj, type) => {
      const pos = obj.position;
      const size =
        type === "module"
          ? [obj.ancho, obj.alto, obj.profundidad]
          : obj.args;
      return {
        min: [
          pos[0] - size[0] / 2,
          pos[1] - size[1] / 2,
          pos[2] - size[2] / 2,
        ],
        max: [
          pos[0] + size[0] / 2,
          pos[1] + size[1] / 2,
          pos[2] + size[2] / 2,
        ],
      };
    };

    const distanceBetweenAABBs = (box1, box2) => {
      let distance = 0;
      for (let i = 0; i < 3; i++) {
        const d = Math.max(
          0,
          box1.min[i] - box2.max[i],
          box2.min[i] - box1.max[i]
        );
        distance += d * d;
      }
      return Math.sqrt(distance);
    };

    const modulosConMaterial = placedModules.map((modulo) => {
      const moduleBox = getAABB(modulo, "module");
      let minDistance = Infinity;
      for (const opening of openings) {
        const openingBox = getAABB(opening, "opening");
        const distance = distanceBetweenAABBs(moduleBox, openingBox);
        if (distance < minDistance) {
          minDistance = distance;
        }
      }

      const isNearOpening = minDistance <= 4;

      const material = new THREE.MeshStandardMaterial({
        color: isNearOpening ? "red" : "white",
        transparent: isNearOpening,
        opacity: isNearOpening ? 0.9 : 1,
        depthWrite: !isNearOpening,
      });

      return {
        ...modulo,
        material,
      };
    });

    return (
      <Canvas
        camera={{ position: [0, 300, 600], fov: 50, near: 0.1, far: 10000 }}
        style={{ width: "100vw", height: "100%" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedObject(null);
          }
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 500, 500]} intensity={1.2} />
        <pointLight
          position={[
            espacio.ancho / 2,
            espacio.alto / 2,
            espacio.largo / 2,
          ]}
          intensity={1.5}
        />
        <OrbitControls ref={controlsRef} />

        {/* Floor and walls */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[espacio.ancho / 2, 0, espacio.largo / 2]}
        >
          <planeGeometry args={[espacio.ancho, espacio.largo]} />
          <meshStandardMaterial color="lightgray" />
        </mesh>
        {wallTexture.id !== 'default' ? (
          <Wall
            textureMaps={wallTexture.maps}
            scale={textureScale}
            args={[espacio.ancho, espacio.alto, 1]}
            position={[espacio.ancho / 2, espacio.alto / 2, 0]}
          />
        ) : (
          <Box
            args={[espacio.ancho, espacio.alto, 1]}
            position={[espacio.ancho / 2, espacio.alto / 2, 0]}
          >
            <meshStandardMaterial color="lightblue" opacity={0.5} transparent />
          </Box>
        )}
        {wallTexture.id !== 'default' ? (
          <Wall
            textureMaps={wallTexture.maps}
            scale={textureScale}
            args={[1, espacio.alto, espacio.largo]}
            position={[0, espacio.alto / 2, espacio.largo / 2]}
          />
        ) : (
          <Box
            args={[1, espacio.alto, espacio.largo]}
            position={[0, espacio.alto / 2, espacio.largo / 2]}
          >
            <meshStandardMaterial color="lightblue" opacity={0.5} transparent />
          </Box>
        )}

        {/* Modules */}
        {modulosConMaterial.map((modulo) => (
          <DraggableWallObject
            key={modulo.id}
            initialPosition={modulo.position}
            onDrag={(newPos) => handleModuleDrag(modulo.id, newPos)}
            setIsDragging={setIsDragging}
            wall={wallMapping[modulo.pared]}
            espacio={espacio}
            size={[modulo.ancho, modulo.alto, modulo.profundidad]}
            stickToWall={true}
            isDraggable={selectedObject?.id === modulo.id}
          >
            <Box
              args={[modulo.ancho, modulo.alto, modulo.profundidad]}
              material={modulo.material}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject({type: 'module', id: modulo.id})
              }}
            >
              <Edges color={selectedObject?.id === modulo.id ? "blue" : "white"} />
            </Box>
          </DraggableWallObject>
        ))}

        {/* Openings */}
        {openings.map((opening) => (
          <DraggableWallObject
            key={opening.id}
            initialPosition={opening.position}
            onDrag={(newPos) => handleOpeningDrag(opening.id, newPos)}
            setIsDragging={setIsDragging}
            rotation={getRotationFromWall(opening.pared)}
            espacio={espacio}
            wall={wallMapping[opening.pared]}
            size={opening.args}
            isDraggable={selectedObject?.id === opening.id}
          >
            <Box 
              args={opening.args}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObject({type: 'opening', id: opening.id})
              }}
            >
              <meshStandardMaterial
              transparent={true}
              color="lightblue"
              opacity={0.3}
              />
                <Edges color={selectedObject?.id === opening.id ? "blue" : "grey"} />
            </Box>
          </DraggableWallObject>
        ))}
      </Canvas>
    );
  }
);
Scene.displayName = "Scene";
