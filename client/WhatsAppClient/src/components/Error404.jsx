import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

export function Error404() {
  return (
    <>
      <div className="Error404">
        <div className="containerError">
          <div className="mensaje">
            <h1 className="tituloError">¡Ups!</h1>
            <h2 className="subtituloError">4<img src="/whatsapp.svg" alt="WhatsApp Icon" className="iconoWhatsapp"/>4</h2>
            <p className="textoError">La página no se encuentra disponible</p>
            <Link className="LinkRouter" to="/">
              <button className="boton">Volver al inicio</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
