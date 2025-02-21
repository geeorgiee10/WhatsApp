const express = require('express')
const path = require('path')
const port = 2908
const { Server } = require('socket.io');
const { createServer } = require('node:http');


const app = express()
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5174", 
    methods: ["GET", "POST"]
  }
});
var numeroUsuarios = 0;
var listaUsuarios = [];

/*app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/WhatsAppClient/index.html'));
})*/

app.use(express.static(path.join(__dirname, '/public')))

io.on('connection', (socket) => {
  numeroUsuarios++;
  console.log('Nuevo usuarios, hay ' + numeroUsuarios + ' usuarios conectados');

  socket.on("nombre", (nombre) =>{
      socket.nombre = nombre;
      socket.broadcast.emit("Conectado", nombre);
      listaUsuarios.push(nombre);
      console.log(listaUsuarios);
      io.emit("lista", listaUsuarios);

      socket.on('mensaje', (jsonDatos)=>{
        console.log("Soy el servidor y recibo mensaje " + jsonDatos);
        io.emit("HolaDesdeElServidor", jsonDatos);
      });

      socket.on("escribiendo", (nombre) => {
        socket.broadcast.emit("escribiendo", nombre);
      });

      socket.on("noEscribiendo", (nombre) => {
        socket.broadcast.emit("noEscribiendo", nombre);
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
        numeroUsuarios--;
        listaUsuarios = listaUsuarios.filter(usuario => usuario !== socket.nombre);
        io.emit("lista", listaUsuarios);
        socket.broadcast.emit("Desconectado", socket.nombre);
        console.log('Ahora hay ' + numeroUsuarios + ' usuarios conectados');
      });
      
  });

  
  
  
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})