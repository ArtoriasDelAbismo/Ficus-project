import { useState, useEffect } from "react";

export const useConfigurador = () => {
  const [modulos, setModulos] = useState([]);
  const [espacio, setEspacio] = useState({ ancho: 300, largo: 300, alto: 250 });
  const [openings, setOpenings] = useState([]);
  const [selectedOpening, setSelectedOpening] = useState(null);

  useEffect(() => {
    const fetchModulos = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/modulos");
        const data = await response.json();
        setModulos(data.map(m => ({...m, position: [m.ancho / 2, m.alto / 2, m.profundidad / 2]})));
      } catch (error) {
        console.error("Error fetching modulos", error);
      }
    };
    fetchModulos();
  }, []);

  useEffect(() => {
    if (selectedOpening) {
      setSelectedOpening(openings.find(o => o.id === selectedOpening.id));
    }
  }, [openings, selectedOpening]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEspacio((prevEspacio) => ({ ...prevEspacio, [name]: Number(value) }));
  };

  const addOpening = (type) => {
    const newOpening = {
      id: Date.now(),
      type,
      position: [espacio.ancho / 2, type === 'door' ? 100 : 120, 0],
      args: type === 'door' ? [80, 200, 5] : [100, 80, 5],
      distanciaDesdePared: espacio.ancho / 2,
      distanciaDesdeSuelo: type === 'door' ? 0 : 120,
      pared: 'frontal',
      rotation: [0, 0, 0]
    };
    setOpenings([...openings, newOpening]);
    setSelectedOpening(newOpening);
  };

  const handleOpeningPositionChange = (e, openingId) => {
    const { name, value } = e.target;
    const newOpenings = openings.map(o => {
      if (o.id === openingId) {
        const updatedOpening = { ...o, [name]: name === 'pared' ? value : Number(value) };
        
        const yPos = updatedOpening.distanciaDesdeSuelo + updatedOpening.args[1] / 2;

        if (updatedOpening.pared === 'frontal') {
          updatedOpening.position = [updatedOpening.distanciaDesdePared, yPos, 0];
        } else if (updatedOpening.pared === 'trasera') {
          updatedOpening.position = [updatedOpening.distanciaDesdePared, yPos, espacio.largo];
        } else if (updatedOpening.pared === 'izquierda') {
          updatedOpening.position = [0, yPos, updatedOpening.distanciaDesdePared];
        } else if (updatedOpening.pared === 'derecha') {
          updatedOpening.position = [espacio.ancho, yPos, updatedOpening.distanciaDesdePared];
        }
        return updatedOpening;
      }
      return o;
    });
    setOpenings(newOpenings);
  };

  const removeOpening = (openingId) => {
    setOpenings(openings.filter(o => o.id !== openingId));
    if (selectedOpening && selectedOpening.id === openingId) {
      setSelectedOpening(null);
    }
  };

  return {
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
    removeOpening
  };
};
