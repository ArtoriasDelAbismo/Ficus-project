import { useThree } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react'
import { useDrag } from '@use-gesture/react';
import * as THREE from "three";


export const DraggableWallObject = ({
  children,
  onDrag,
  initialPosition = [0, 0, 0],
  setIsDragging,
  wall,
  espacio,
  rotation = [0, 0, 0],
  size = [50, 50, 50],
  stickToWall = false,
  isDraggable = false,
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
      if (!isDraggable) return;
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

        const [width, height, depth] = size;

        if (wallRef.current === "left") {
          newX = stickToWall ? width / 2 : 0;
        } else if (wallRef.current === "right" && espacio) {
          newX = stickToWall ? espacio.ancho - width / 2 : espacio.ancho;
        } else if (wallRef.current === "front") {
          newZ = stickToWall ? depth / 2 : 0;
        } else if (wallRef.current === "back" && espacio) {
          newZ = stickToWall ? espacio.largo - depth / 2 : espacio.largo;
        }
      }

      const [width, height, depth] = size;

      if (wallRef.current === "left" || wallRef.current === "right") {
        newZ = Math.max(
          depth / 2,
          Math.min(newZ, espacio.largo - depth / 2)
        );
      } else if (wallRef.current === "front" || wallRef.current === "back") {
        newX = Math.max(
          width / 2,
          Math.min(newX, espacio.ancho - width / 2)
        );
      }

      newY = Math.max(
        height / 2,
        Math.min(newY, espacio.alto - height / 2)
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
    <group position={pos} {...bind()} cursor={isDraggable ? "grab" : "pointer"} rotation={rotation}>
      {children}
    </group>
  );
};
