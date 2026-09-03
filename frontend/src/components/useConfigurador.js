import { useState, useEffect } from "react";

export const useConfigurador = () => {
  const [availableModules, setAvailableModules] = useState([]);
  const [placedModules, setPlacedModules] = useState([]);
  const [espacio, setEspacio] = useState({ ancho: 300, largo: 300, alto: 250 });
  const [openings, setOpenings] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [wallTexture, setWallTexture] = useState({ id: "default" });
  const [textureScale, setTextureScale] = useState(1);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const fetchModulos = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/modulos`);
        const data = await response.json();
        setAvailableModules(data);
      } catch (error) {
        console.error("Error fetching modulos", error);
      }
    };
    fetchModulos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEspacio((prevEspacio) => ({ ...prevEspacio, [name]: Number(value) }));
  };

  const addOpening = (type) => {
    const countOfType = openings.filter((o) => o.type === type).length;
    const newOpening = {
      id: crypto.randomUUID(),
      displayId: countOfType + 1,
      type,
      position: [espacio.ancho / 2, type === "door" ? 100 : 120, 0],
      args: type === "door" ? [80, 200, 5] : [100, 80, 5],
      distanciaDesdePared: espacio.ancho / 2,
      distanciaDesdeSuelo: type === "door" ? 0 : 80,
      pared: "frontal",
      rotation: [0, 0, 0],
    };
    setOpenings([...openings, newOpening]);
    setSelectedObject({type: 'opening', id: newOpening.id});
  };

  const addModule = (moduleToAdd) => {
    const newModule = {
      ...moduleToAdd,
      id: crypto.randomUUID(),
      position: [
        moduleToAdd.ancho / 2,
        moduleToAdd.alto / 2,
        moduleToAdd.profundidad / 2,
      ],
      pared: "frontal",
    };
    setPlacedModules((prev) => [...prev, newModule]);
  };

  const handleOpeningPositionChange = (e, openingId) => {
    const { name, value } = e.target;
    const newOpenings = openings.map((o) => {
      if (o.id === openingId) {
        const updatedOpening = {
          ...o,
          [name]: name === "pared" ? value : Number(value),
        };

        const yPos =
          updatedOpening.distanciaDesdeSuelo + updatedOpening.args[1] / 2;

        if (updatedOpening.pared === "frontal") {
          updatedOpening.position = [
            updatedOpening.distanciaDesdePared,
            yPos,
            0,
          ];
        } else if (updatedOpening.pared === "trasera") {
          updatedOpening.position = [
            updatedOpening.distanciaDesdePared,
            yPos,
            espacio.largo,
          ];
        } else if (updatedOpening.pared === "izquierda") {
          updatedOpening.position = [
            0,
            yPos,
            updatedOpening.distanciaDesdePared,
          ];
        } else if (updatedOpening.pared === "derecha") {
          updatedOpening.position = [
            espacio.ancho,
            yPos,
            updatedOpening.distanciaDesdePared,
          ];
        }
        return updatedOpening;
      }
      return o;
    });
    setOpenings(newOpenings);
  };

  const removeOpening = (openingId) => {
    setOpenings(openings.filter((o) => o.id !== openingId));
    if (selectedObject && selectedObject.id === openingId) {
      setSelectedObject(null);
    }
  };

  return {
    availableModules,
    placedModules,
    setPlacedModules,
    espacio,
    handleInputChange,
    openings,
    setOpenings,
    selectedObject,
    setSelectedObject,
    addOpening,
    addModule,
    handleOpeningPositionChange,
    removeOpening,
    isOpen,
    setIsOpen,
    wallTexture,
    setWallTexture,
    textureScale,
    setTextureScale,
  };
};
