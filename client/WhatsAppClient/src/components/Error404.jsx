import { BrowserRouter, Routes, Route, Link } from "react-router-dom";


export function Error404() {

  return (
    <>
      
      <div className="Error404">
      <div className="containerError">
        <div className="message">
          <h1 className="h1Error">Sorry</h1>
          <h2 className="h2Error">4<img className='logoLetra' src="../public/png-clipart-pokemon-logo-pokemon-logo.png"></img>4</h2>
          <div className="icon">
            <img
              src="../public/png-clipart-pokemon-logo-pokemon-logo.png" 
              alt="Pokéball"
              className="pokeball"
            />
          </div>
          <p>Pokemon not found</p>
          <Link className="LinkRouter" to="/">
            <a className="back-button">BACK HOME</a>
          </Link>
        </div>
      </div>
    </div>
      
    </>
  )
}

