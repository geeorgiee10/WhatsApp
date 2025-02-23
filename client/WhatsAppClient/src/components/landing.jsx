import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function Landing() {
  const [barraCargaActiva, setbarraCargaActiva] = useState(false);
  const navigate = useNavigate(); 

  const handleClick = () => {
    setbarraCargaActiva(true);
    setTimeout(() => {
      setbarraCargaActiva(false); 
      // Funcion del react router para redirigir a otro componente(a parte del link)
      navigate('/chat'); 
    }, 2000);
  };

  return (
    <div className="containerLanding">
      <div className="landingPage">
        <div className="landingContent">
          <img className="whatsappIcono" src="/whatsapp.svg" alt="logo whatsapp" />
          <h1 className="tituloLanding">Bienvenido a Fake WhatsApp Web</h1>
          <p className="textoLanding">Un lugar para conectarte con personas en cualquier parte del mundo</p>

          {barraCargaActiva && <div className="barraCarga"></div>}

          <button className="whatsappBoton" onClick={handleClick}>Entrar al chat</button>
          </div>

        <div className="qr">
          <img src="/qr.svg" alt="QR decorativo" />
        </div>
        
      </div>

      
    </div>
  );
}
