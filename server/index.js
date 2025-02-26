const express = require('express')
const path = require('path')
const port = process.env.PORT || 4000;
const fileUpload = require('express-fileupload');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const fs = require('fs');
const cors = require('cors'); 


const app = express()
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  },
  addTrailingSlash: false
});
var numeroUsuarios = 0;
var listaUsuarios = [];


const imagenesPredefinidas = [
  "./images/man.png",
  "./images/boy.png",
  "./images/girl.png",
  "./images/woman.png",
  "./images/gamer.png"
];

/*app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/WhatsAppClient/index.html'));
})*/

app.use(fileUpload());
app.use(express.static(path.join(__dirname, '/public')))
app.use('/uploads', express.static(path.join(__dirname, '/public/uploads')));
app.use(cors());

app.post('/upload', (req, res) => {
  let archivos;
  let rutaGuardar;

  // Verifica si se subió un archivo
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se ha recibido ningún archivo');
  }

  // Obtener el archivo desde el campo del formulario
  archivos = req.files.sampleFile;
  
  // Establecer la ruta de subida del archivo (en este caso, dentro de la carpeta public/uploads/)
  rutaGuardar = path.join(__dirname, '/public/uploads/', archivos.name);

  // Crear la carpeta uploads si no existe
  if (!fs.existsSync(path.join(__dirname, '/public/uploads/'))) {
    fs.mkdirSync(path.join(__dirname, '/public/uploads/'), { recursive: true });
  }

  // Mover el archivo subido a la ruta de destino
  archivos.mv(rutaGuardar, function(err) {
    if (err) {
      console.error("Error al mover el archivo:", err);
      return res.status(500).send(err);
    }

    // Responder con la URL del archivo cargado
    let urldelArchivo = `/uploads/${archivos.name}`;
    console.log("Archivo guardado en:", urldelArchivo);
    
    // Crear objeto con información completa del archivo
    const archivoInfo = {
      nombre: archivos.name,
      url: urldelArchivo,
      tipo: archivos.mimetype
    };
    
    // No necesitamos emitir un evento aquí, ya que el cliente lo hará a través del evento "mensaje"
    // io.emit('nuevoArchivo', archivoInfo);

    // Devolver la información completa del archivo
    res.json(archivoInfo);
  });
});

io.on('connection', (socket) => {
  numeroUsuarios++;
  socket.emit("imagenesPredefinidas", imagenesPredefinidas);
  console.log('Nuevo usuarios, hay ' + numeroUsuarios + ' usuarios conectados');

  socket.on("nombre", ({ nombre, estado, imagenPredefinida }) =>{
      socket.nombre = nombre;
      socket.estado = estado;
      socket.imagenPredefinida = imagenPredefinida;
      socket.broadcast.emit("Conectado", nombre);
      listaUsuarios.push({ nombre, estado, imagenPredefinida });
      console.log(listaUsuarios);
      io.emit("lista", listaUsuarios);

      socket.on('mensaje', (jsonDatos)=>{
        console.log("Soy el servidor y recibo mensaje " + jsonDatos);

        const datos = typeof jsonDatos === 'string' ? jsonDatos : JSON.stringify(jsonDatos);

        io.emit("HolaDesdeElServidor", datos);
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
        listaUsuarios = listaUsuarios.filter(usuario => usuario.nombre !== socket.nombre);
        io.emit("lista", listaUsuarios);
        if (socket.nombre) {
          socket.broadcast.emit("Desconectado", socket.nombre);
        }
        console.log('Ahora hay ' + numeroUsuarios + ' usuarios conectados');
      });
      
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})