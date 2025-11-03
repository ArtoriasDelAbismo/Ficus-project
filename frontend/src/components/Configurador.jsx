import { useState } from "react";
import "./Configurador.css";
import { useConfigurador } from "./useConfigurador";
import { FaTrash } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { RiWindowsLine } from "react-icons/ri";
import { BsDoorOpenFill } from "react-icons/bs";
import { IoBanOutline } from "react-icons/io5";
import { LuPanelLeftOpen } from "react-icons/lu";
import { LuPanelRightOpen } from "react-icons/lu";
import { Scene } from "./Scene";
import brickColor from "../assets/textures/walls/Bricks/Bricks059_2K-JPG_Color.jpg";
import brickDisplacement from "../assets/textures/walls/Bricks/Bricks059_2K-JPG_Displacement.jpg";
import brickNormal from "../assets/textures/walls/Bricks/Bricks059_2K-JPG_NormalGL.jpg";
import brickRoughness from "../assets/textures/walls/Bricks/Bricks059_2K-JPG_Roughness.jpg";
import plasterColor from "../assets/textures/walls/Plaster/Plaster002_2K-JPG_Color.jpg";
import plasterDisplacement from "../assets/textures/walls/Plaster/Plaster002_2K-JPG_NormalDX.jpg";
import plasterNormal from "../assets/textures/walls/Plaster/Plaster002_2K-JPG_NormalGL.jpg";
import plasterRoughness from "../assets/textures/walls/Plaster/Plaster002_2K-JPG_Roughness.jpg";
import bricks094Color from "../assets/textures/walls/Bricks094/Bricks094_2K-JPG_Color.jpg";
import bricks094Displacement from "../assets/textures/walls/Bricks094/Bricks094_2K-JPG_Displacement.jpg";
import bricks094Normal from "../assets/textures/walls/Bricks094/Bricks094_2K-JPG_NormalGL.jpg";
import bricks094Roughness from "../assets/textures/walls/Bricks094/Bricks094_2K-JPG_Roughness.jpg";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';


function Configurador() {
  const {
    placedModules,
    setPlacedModules,
    espacio,
    handleInputChange,
    openings,
    setOpenings,
    selectedObject,
    setSelectedObject,
    addOpening,
    handleOpeningPositionChange,
    removeOpening,
    wallTexture,
    setWallTexture,
    textureScale,
    setTextureScale,
    availableModules,
    addModule,
  } = useConfigurador();
  const [openingsOpenState, setOpeningsOpenState] = useState({});
  const [sideBarOpen, setSideBarOpen] = useState(false)

  const wallTextures = [
        {
      id: "default",
      name: "Default",
      maps: {
        color: null,
        displacement: null,
        normal: null,
        roughness: null,
      },
    },
    {
      id: "bricks",
      name: "Bricks",
      maps: {
        color: brickColor,
        displacement: brickDisplacement,
        normal: brickNormal,
        roughness: brickRoughness,
      },
    },
    {
      id: "plaster",
      name: "Plaster",
      maps: {
        color: plasterColor,
        displacement: plasterDisplacement,
        normal: plasterNormal,
        roughness: plasterRoughness,
      },
    },
    {
      id: "bricks094",
      name: "Bricks094",
      maps: {
        color: bricks094Color,
        displacement: bricks094Displacement,
        normal: bricks094Normal,
        roughness: bricks094Roughness
      }
    }
  ];

  const toggleOpening = (openingId) => {
    setOpeningsOpenState((prev) => ({
      ...prev,
      [openingId]: !prev[openingId],
    }));
  };

  return (
    <div className="configurador-container">
      {/* Panel lateral */}
      <div style={{cursor:'pointer', padding:'16px', height:'fit-content', position:'absolute', zIndex:'2000'}} onClick={() => setSideBarOpen(!sideBarOpen)}>
        
          {sideBarOpen ? <LuPanelRightOpen style={{height:'30px', width:'30px', color:'#a8a8a8'}}/> : <LuPanelLeftOpen style={{height:'30px', width:'30px'}}/>}

      </div>
        <div className={`panel-lateral ${sideBarOpen ? "" : "closed"}`}>
          <div className="panel-lateral-content">
            <div
              className="flex-center"
              style={{
                fontSize: "4rem",
              }}
            >
              <p style={{margin:'20px'}}>Ficus view</p>
            </div>
            <div className="sidebar-container">
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
            </div>

                          <div
                className="sidebar-container"
                style={{
                  justifyContent: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <h2>Aberturas</h2>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button onClick={() => addOpening("door")}>
                    <BsDoorOpenFill />
                  </button>
                  <button onClick={() => addOpening("window")}>
                    <RiWindowsLine />
                  </button>
                </div>
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
                      setSelectedObject({type: 'opening', id: opening.id});
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
                      selectedObject?.id === opening.id
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

            <div className="sidebar-container">
              <h2>Módulos disponibles</h2>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={10}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                className="modulos-carousel"
              >
                {availableModules.map((modulo) => (
                  <SwiperSlide key={modulo.id}>
                    <div className="module-slide-content">
                      <span style={{position:'relative', top:'-16px'}}>{modulo.tipo}</span>
                      <img
                        style={{ borderRadius: "8px" }}
                        src={modulo.imagen}
                        alt={modulo.tipo}
                        width="100"
                        height="100"
                      />
                      <span>
                        ({modulo.ancho}x{modulo.alto}x
                        {modulo.profundidad})
                      </span>
                      <button onClick={() => addModule(modulo)}>Add</button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <div className="sidebar-container">
              <h2>Texturas</h2>
              <div className="textures-section">
                <h3>Paredes</h3>
                <div className="texture-options">
                  {wallTextures.map((texture) =>
                    texture.id === "default" ? (
                      <IoBanOutline
                      style={{color:'#aaa'}}
                        key={texture.id}
                        className={`texture-option ${
                          wallTexture.id === texture.id ? "selected" : ""
                        }`}
                        onClick={() => setWallTexture(texture)}
                      />
                    ) : (
                      <img
                        key={texture.id}
                        src={texture.maps.color}
                        alt={texture.name}
                        className={`texture-option ${
                          wallTexture.id === texture.id ? "selected" : ""
                        }`}
                        onClick={() => setWallTexture(texture)}
                      />
                    )
                  )}
                </div>
              </div>
              <div className="texture-scale-section">
                <label>
                  <input
                    type="range"
                    min="0.1"
                    max="2"
                    step="0.01"
                    value={textureScale}
                    onChange={(e) => setTextureScale(Number(e.target.value))}
                  />
                  <span>{textureScale}</span>
                </label>
              </div>
            </div>





          </div>
          </div>

      {/* Área de visualización 3D */}
      <div className="visualizacion-3d">
        <Scene
          espacio={espacio}
          placedModules={placedModules}
          setPlacedModules={setPlacedModules}
          openings={openings}
          setOpenings={setOpenings}
          setSelectedObject={setSelectedObject}
          selectedObject={selectedObject}
          wallTexture={wallTexture}
          textureScale={textureScale}
        />
      </div>
    </div>
  );
}

export default Configurador;