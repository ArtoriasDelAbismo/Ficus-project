import { useState} from "react";
import "./Configurador.css";
import { useConfigurador } from "./useConfigurador";
import { FaTrash } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { RiWindowsLine } from "react-icons/ri";
import { BsDoorOpenFill } from "react-icons/bs";
import { Scene } from "./Scene";



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
          className="flex-center"
          style={{
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
          className="flex-center"
          style={{
            width: "100%",
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
                <div className="divider"></div>
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
                <div className="divider"></div>

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
                    <div className="divider"></div>
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
