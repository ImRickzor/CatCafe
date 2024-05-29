const express = require('express')
const jwt = require('jsonwebtoken')
const config = require('./public/js/config')
const fs = require('fs');

const app = express()
app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended:false}))

const users = require('./users.json');
const reservas = require('./reservas.json');

app.all('/user', (req, res, next) => {
    console.log('Paso por aqui')
    next()
})

//Rutas

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html')
})

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.get('/about', (req, res) => {
    res.sendFile(__dirname + '/public/about.html')
})

app.get('/cats', (req, res) => {
    res.sendFile(__dirname + '/public/cats.html')
})

app.get('/coffees', (req, res) => {
    res.sendFile(__dirname + '/public/coffees.html')
})

app.get('/contact', (req, res) => {
    res.sendFile(__dirname + '/public/contact.html')
})

app.get('/postres', (req, res) => {
    res.sendFile(__dirname + '/public/postres.html')
})

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const existingUser = users.users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(username)) {
        return res.status(400).json({ error: 'Formato de correo inválido' });
    }

    const newUser = {
        username: username,
        password: password
    };

    users.users.push(newUser);

    fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));

    const token = jwt.sign({ username }, config.secret, { expiresIn: '1h' });

    res.status(200).json({ message: 'Usuario registrado exitosamente', token });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.users.find(u => u.username === username && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });

    res.status(200).json({ message: 'Inicio de sesión exitoso', token });

    //res.redirect('/protected');
});

app.post('/reservar', (req, res) => {
    
    const { nombres, correo, telefono, fechahora, Mensaje } = req.body;
    const reservaExistente = reservas.reservas.find(r => r.fechahora === fechahora);
    console.log("nombres: " + nombres + " " + "correo: " + correo);
    console.log("ReservaExistente: " + reservaExistente);
    if (reservaExistente) {
        return res.status(400).json({ error: 'Ya existe una reserva para esta fecha y hora' });
    }

    reservas.reservas.push({
        nombres,
        correo,
        telefono,
        fechahora,
        Mensaje
    });
    fs.writeFileSync('./reservas.json', JSON.stringify(reservas, null, 2));
    console.log("Se añadio la reserva al JSON")
    //res.redirect('/confirmacion.html');
    res.send('¡Reserva realizada con éxito!');
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ error: 'Token no proporcionado,' + " " + "Este es tu token: " +  token});
    }
    try {
      const decoded = jwt.verify(token, 'secret_key');
      req.user = decoded.username;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
  
  app.get('/protected', verifyToken, (req, res) => {
    res.redirect('/admin.html');
});

app.get('/invalid-token', (req, res) => {
    res.status(401).send('Token inválido. Por favor, inicia sesión nuevamente.');
});

app.listen(config.port, () => {
    console.log(`servidor corriendo en el puerto ${config.port}, http://localhost:3000`)
})


