import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

var socket;

export function Chat() {
    
    const [messages, setMessages] = useState([]);
    const [mensajeEscribiendo, setMensajeEscribiendo] = useState([])
    const [users, setUsers] = useState([]);
    const [user, setUser] = useState('');
    const [text, setText] = useState('');
    const [temporizador, setTemporizador] = useState(null);
    const [estaEscribiendo, setEstaEscribiendo] = useState(false);
    const [estaConectado, setEstaConectado] = useState(false);

    useEffect(() => {
        socket = io(/*"http://127.0.0.1:5000"*/);
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

    const sendMessage = () => {
        if (text.trim() === '') return;
        const mensaje = { nombre: user, texto: text};
        socket.emit("mensaje", JSON.stringify(mensaje));
        setText('');
        socket.emit("noEscribiendo", user);
        setEstaEscribiendo(false);
    };

    const sendUserName = () => {
        if (socket && user.trim()) {
            socket.emit("nombre", user);
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
                    <input type="text" placeholder="Tu nombre" value={user} onChange={(e) => setUser(e.target.value)}/>
                    <button onClick={sendUserName} >Enviar Nombre</button>
                </div>
            ):(
                <div className='chatGrupal'>
                    <div className='listaUsuarios'>
                        <h2>Usuarios conectados</h2>
                        <ul>
                            {users.map((user, index) => (
                                <li key={index}>{user}</li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className='apartadoMensajes'>
                        <div className='menuSuperior'>
                            <div className='detallesMenu'>
                                <h2>Chat Grupal</h2>

                                <div className='botones'>
                                    <button className='btnCall'><i class="fa-solid fa-video"></i></button>
                                    <button className='btnCall'><i class="fa-solid fa-phone"></i></button>
                                    <button className='btnSearch'><i class="fa-solid fa-magnifying-glass"></i></button>
                                </div>
                            </div>
                            <div>
                                {mensajeEscribiendo.map((message, index) => (
                                    <p key={index} className='mensajeEscribiendo'>{message.nombre}</p>
                                ))}
                            </div>
                            
                        </div>
                        <ul className='mensajes'>
                            {messages.map((message, index) => (
                                <li key={index} 
                                className={message.texto === "se ha conectado" || message.texto === "se ha desconectado" ? "mensajeConectado" : (message.nombre === user ? "mensajePropio" : "mensajeOtro")}>
                                    <span className='nombreMensaje'>{message.nombre}</span> {message.texto}
                                </li>
                            ))}
                        </ul>

                        <div className='inputMensaje'>
                            <input type="text" placeholder="Escribe un mensaje" value={text} 
                                onChange={(e) => {setText(e.target.value); comprobarEstaEscribiendo();}}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button onClick={sendMessage}><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>

            </div>
        )}
        </div>
    );
}
