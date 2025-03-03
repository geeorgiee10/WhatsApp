import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { io } from 'socket.io-client';

var socket;

export function Chat() {
    
    const [messages, setMessages] = useState([]);
    const [mensajeEscribiendo, setMensajeEscribiendo] = useState([])
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState('');
    const [estado, setEStado] = useState('');
    const [text, setText] = useState('');
    const [temporizador, setTemporizador] = useState(null);
    const [estaEscribiendo, setEstaEscribiendo] = useState(false);
    const [estaConectado, setEstaConectado] = useState(false);
    const [imagenes, setImagenes] = useState([]);
    const [imagenElegida, setimagenElegida] = useState('');
    const [archivos, setArchivos] = useState(null);

    useEffect(() => {
        socket = io(/*"http://127.0.0.1:4000"*/);
        socket.connect();

        
      
        socket.on("HolaDesdeElServidor", (jsonDatos) => {
            let datos = JSON.parse(jsonDatos);
            setMessages(prev => {
                if (prev[prev.length - 1]?.texto !== datos.texto) {
                    return [...prev, datos]; 
                }
                return prev;  
            });
        });

        socket.on("Conectado", (nombre) => {
            setMessages(prev => {
                if (prev[prev.length - 1]?.nombre !== nombre || prev[prev.length - 1]?.texto !== "se ha conectado") {
                    return [...prev, { nombre, texto: "se ha conectado", imagen: "" }];
                }
                return prev;
            });
        });

        socket.on("Desconectado", (nombre) => {
            setMessages(prev => {
                if (prev[prev.length - 1]?.nombre !== nombre || prev[prev.length - 1]?.texto !== "se ha desconectado") {
                    return [...prev, { nombre, texto: "se ha desconectado", imagen: "" }];
                }
                return prev; 
            });
        });

        socket.on("imagenesPredefinidas", (lista) => {
            setImagenes(lista);
            setimagenElegida(lista[0]); 
        });

        socket.on("lista", (lista) => {
            setUsers(lista);
        });

        socket.on("escribiendo", (nombre) =>{
            setMensajeEscribiendo(prev => {
                const mensajeEscribiendo = {nombre: `${nombre} está escribiendo...`}
                if(!prev.some(mensaje => mensaje.nombre === mensajeEscribiendo.nombre)){
                    return [...prev, mensajeEscribiendo];
                }
                return prev;
            });
        });

        socket.on("noEscribiendo", (nombre) =>{
            setMensajeEscribiendo(prev=> prev.filter(mensaje => mensaje.nombre !== `${nombre} está escribiendo...`));
        });

        return () => {
            socket.disconnect();
            setEstaConectado(false);
        };
    }, []);



    const subirArchivo = async () => {
        if (!archivos) return;
        
        const formData = new FormData();
        formData.append('sampleFile', archivos);
        
        try {
            console.log("Enviando archivo:", archivos.name);

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            const mensaje = { 
                nombre: user, 
                texto: text, 
                imagen: imagenElegida,
                archivo: {
                  url: data.url,
                  nombre: archivos.name,
                  tipo: archivos.type
                }
              };
            
            socket.emit("mensaje", JSON.stringify(mensaje));
            setText('');
            setArchivos(null);
        } catch (error) {
            console.error("Error al subir el archivo:", error);
        }
    };

    const sendMessage = () => {
        if (text.trim() === '' && !archivos) return;
        
        if(archivos){
            subirArchivo();
        }
        else{
            const mensaje = { nombre: user, texto: text, imagen: imagenElegida }; 
            socket.emit("mensaje", JSON.stringify(mensaje));
            setText('');
        }
        
        socket.emit("noEscribiendo", user);
        setEstaEscribiendo(false);
    };

    const sendUserName = () => {
        if (socket && user.trim()) {
            socket.emit("nombre", { nombre: user, estado: estado, imagenPredefinida: imagenElegida });
            setEstaConectado(true);
        }
    };

    const comprobarEstaEscribiendo = () =>{
        if(!estaEscribiendo){
            setEstaEscribiendo(true);
            socket.emit("escribiendo", user);
        }

        if(temporizador){
            clearTimeout(temporizador);
        }

        setTemporizador(setTimeout(() => {
            socket.emit("noEscribiendo", user);
            setEstaEscribiendo(false);
        }, 2000));
    }

    return (
        <div className='chat'>
            {!estaConectado ?(
                <div className='login'>
                    <div className='loginForm'>
                        <h1>Elige tus datos</h1>
                        <label htmlFor="nombre">Nombre</label>
                        <input id='nombre' type="text" placeholder="Escribe tu nombre" value={user} onChange={(e) => setUser(e.target.value)} required/>

                        <label htmlFor="estado">Estado</label>
                        <input id='estado' type="text" placeholder="Escribe un estado" value={estado} onChange={(e) => setEStado(e.target.value)}/>

                        <label htmlFor="avatar">Elige tu avatar</label>
                        <div className="imagenesPredefinidas">
                            {imagenes.map((avatar, index) => (
                                <img key={index} src={avatar} alt={`Avatar ${index + 1}`}
                                    className={imagenElegida === avatar ? 'avatarSeleccionado' : 'avatar'}
                                    onClick={() => setimagenElegida(avatar)} />
                            ))}
                        </div>
                        <button onClick={sendUserName}>Entrar al chat</button>
                        <Link to="/">
                            <button >Volver atras</button>
                        </Link>
                    </div>
                </div>
            ):(
                <div className='chatGrupal'>
                    <div className='listaUsuarios'>
                        <h2>Usuarios conectados</h2>
                        <ul>
                            {users.map((user, index) => (
                                <li key={index}>
                                    <div className='usuarioDatosPrincipales'>
                                        <img src={user.imagenPredefinida} alt="Avatar" className="imagenAvatarPagina" />
                                        {user.nombre} 
                                    </div>
                                    {user.estado && <span className='estadoUsuario'>{user.estado}</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className='apartadoMensajes'>
                        <div className='menuSuperior'>
                            <div className='detallesMenu'>
                            <div className='datosMenu'>
                                <img src={imagenElegida} alt="Avatar" className="avatar" />
                                <h2>Chat Grupal</h2>
                            </div>

                                <div className='botones'>
                                    <button className='btnCall'><i className="fa-solid fa-video"></i></button>
                                    <button className='btnCall'><i className="fa-solid fa-phone"></i></button>
                                    <button className='btnSearch'><i className="fa-solid fa-magnifying-glass"></i></button>
                                </div>
                            </div>
                            <div>
                                {mensajeEscribiendo.map((message, index) => (
                                    <p key={index} className='mensajeEscribiendo'>{message.nombre}</p>
                                ))}
                                {archivos && (
                                <div className="archivoSeleccionado">
                                    <p>Archivo: {archivos.name}</p>
                                </div>
                            )}
                            </div>
                            
                        </div>
                        <ul className='mensajes'>
                            {messages.map((message, index) => (
                                message.texto !== "se ha conectado" && message.texto !== "se ha desconectado" ? (
                                    <li key={index} className={message.nombre === user ? "mensajePropio" : "mensajeOtro"}>
                                        <div className='mensajeDatos'>
                                            <img src={message.imagen} alt="img" className="imagenAvatarPagina" />
                                            <span className='nombreMensaje'>{message.nombre}</span>
                                        </div>
                                        {message.texto}

                                        {message.archivo && (
                                            <div className="archivoCompartido">
                                                {message.archivo.tipo && message.archivo.tipo.startsWith('image/') ? (
                                                  <div className="imagenYDescarga">
                                                    <img 
                                                      src={message.archivo.url} 
                                                      alt="Imagen compartida" 
                                                      className="imagenCompartida" 
                                                      onClick={() => window.open(message.archivo.url, '_blank')}
                                                    />
                                                    <a 
                                                      href={message.archivo.url} 
                                                      download={message.archivo.nombre}
                                                      className="enlaceDescargaImagen"
                                                    >
                                                      <i className="fa-solid fa-file-download"></i> Descargar
                                                    </a>
                                                  </div>
                                                ) : (
                                                    <a 
                                                        href={message.archivo.url} 
                                                        download={message.archivo.nombre}
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="enlaceDescarga"
                                                    >
                                                            <i className="fa-solid fa-file-download"></i> {message.archivo.nombre}
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ) : (
                                    <li key={index} className="mensajeConectado">
                                        <span className='nombreMensaje'>{message.nombre}</span> {message.texto}
                                    </li>
                                )
                            ))}
                        </ul>

                        <div className='inputMensaje'>
                            <input type="text" placeholder="Escribe un mensaje" value={text} 
                                onChange={(e) => {setText(e.target.value); comprobarEstaEscribiendo();}}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <input type="file" id="fileInput" style={{display: 'none'}} 
                                onChange={(e) => setArchivos(e.target.files[0])}
                            />
                            <button onClick={() => document.getElementById('fileInput').click()}>
                                <i className="fa-solid fa-paperclip"></i>
                            </button>
                            <button onClick={sendMessage}><i className="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>

            </div>
        )}
        </div>
    );
}
