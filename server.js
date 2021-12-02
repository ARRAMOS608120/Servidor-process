const express = require('express')
const app = express()

const listarProductos = require('./generadorFaker.js')

const http = require ('http').Server(app);
const io = require ('socket.io')(http);
const ContenedorSql = require ('./contenedorsql.js')

const {options1} = require('./options/mariaDB');
const {options} = require( './options/SQLite3.js');

const sqlproductos = new ContenedorSql(options1)
const sqlmensajes = new ContenedorSql(options)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const session =  require ('express-session')

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const MongoStore = require ('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }

require('dotenv').config()

app.use(session({
    store: MongoStore.create({ mongoUrl:  process.env.MONGOURL,
    mongoOptions: advancedOptions, ttl: 100
    }),
    secret: 'secreto',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: 100000
    }
}))



const path =  require ('path')

/* ------------------ DATABASE -------------------- */
let mongoose = require('mongoose');
const bCrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
    username: {type: String, require: true},
    password: {type: String, require: true},
})

const usuarioModel = mongoose.model('usuarios', usuarioSchema)

CRUD();

async function CRUD(){
   try{
    const URI = process.env.URIMONGO;
    await mongoose.connect(URI, 
        { 
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 1000
        })
         console.log('Conectado a la base de datos...');         
      
   }  catch(error) {
    throw `Error: ${error}`;
}     
}

/* ------------------ PASSPORT -------------------- */

passport.use('register', new LocalStrategy({
  passReqToCallback: true
}, async (req, username, password, done) => {

let usuarios = await usuarioModel.find({})
const usuario = usuarios.find(usuario => usuario.username == username)

  if (usuario) {
    return done((null, false))
 }

  const user = {
    username,
    password,
  }

try{
  const usuarioNuevo = new usuarioModel({ username: username,  password: createHash(password)})
    usuarioNuevo.save()
  console.log('usuario agregado!')}catch (error) {
    console.log(`Error en operación de base de datos ${error}`)
}

  return done(null, user)
}));

function createHash(password){
    return bCrypt.hashSync(
        password,
        bCrypt.genSaltSync(10),
        null);
}
passport.use('login', new LocalStrategy(async (username, password, done) => {

  let usuarios = await usuarioModel.find({})
  const user = usuarios.find(usuario => usuario.username == username)

  if (!user) {
    return done(null, false)
  }

  if (user.password != password) {
    return done(null, false)
  }

  return done(null, user);
}));

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(async function (username, done) {
  let usuarios = await usuarioModel.find({})
  const usuario = usuarios.find(usuario => usuario.username == username)
  done(null, usuario);
});


app.use(passport.initialize());
app.use(passport.session());

/* --------------------- AUTH --------------------------- */

function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
      next()
    } else {
      res.redirect('/login')
    }
  }

/* --------------------- ROUTES --------------------------- */

// REGISTER
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/plantillas/register.html')
  })
  
  app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister', successRedirect: '/' }))
  
  app.get('/failregister', (req, res) => {
    res.render('register-error');
  })

// LOGIN
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
  })
  
  app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin', successRedirect: '/' }))
  
  app.get('/faillogin', (req, res) => {
    res.render('login-error');
  })


app.set('view engine', 'hbs')

app.set('views', './public/plantillas')

/* --------- LOGOUT ---------- */
app.get('/logout', (req, res) => {
    const nombre = req.user.username
    if (nombre) {
        req.session.destroy(err => {
            if (!err) {
                res.render(path.join(process.cwd(), './public/plantillas/logout.hbs'), { nombre })
                req.logout();
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/')
    }
  })
  
  /* --------- INICIO ---------- */
  app.get('/', isAuth, (req, res) => {
    res.render(path.join(process.cwd(), '/public/plantillas/index.hbs'), {nombre: req.user.username} )
    console.log(req.user.username)
  })

sqlmensajes.crearTablaMensajes();

async function crear ( ){
    await sqlproductos.crearTablaProductos();
}
crear();

io.on('connection', async socket => {

    console.log('Nuevo cliente conectado!');

    socket.emit('productos', await sqlproductos.listarProductos());

    socket.on('update', async producto  => {
        await sqlproductos.insertarProducto(producto)
        io.sockets.emit('productos', await sqlproductos.listarProductos());
    })

    socket.emit('mensajes', await sqlmensajes.listarMensajes());

    socket.on('nuevoMensaje', async mensaje => {
        mensaje.fyh = new Date().toLocaleString()
        await sqlmensajes.insertarMensaje(mensaje)
        io.sockets.emit('mensajes', await sqlmensajes.listarMensajes());
    })
});



app.get('/api/productos-test',function(req, res) {
    const productos = listarProductos()
    res.render('./listaProductos',{productos});
})

 /* --------- MINIMIST ---------- */

const parseArgs = require('minimist');

const optionsMinimist = {
    alias: {
        p: 'puerto',
    },
    default: {
        puerto: 8080,
    }
}

const commandLineArgs = process.argv.slice(2);

const {puerto} = parseArgs(commandLineArgs, optionsMinimist);

 /* --------- PROCESS ---------- */
const args = process.argv

const argumentos = args.slice(2)
const plataforma= process.platform
const version= process.version
const memoria= process.memoryUsage().rss
const pathEje= process.execPath
const pid= process.pid 
const carpeta= process.cwd()

const info = {
  argumentos,
  plataforma,
  version,
  memoria,
  pathEje,
  pid,
  carpeta
}

app.get('/info', (req, res) => {
  res.json({ info })
})

/* --------- FORK  ---------- */
const { fork } = require('child_process')

app.get('/api/randoms', (req, res) => {
  const random = fork(path.resolve(__dirname, 'randoms.js'))
  const { cant } = req.query 
  if (cant==undefined){
    random.send(100000000)
  }else{
    random.send(Number(cant))
  }
  
  random.on('message', resultado => {
      res.json({ resultado })
  })
})
http.listen(puerto, () => console.log('Servidor corriendo...'));