// Importamos los módulos necesarios
const express = require('express');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargamos las variables de entorno
dotenv.config();

// Configuramos la aplicación Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para habilitar CORS
app.use(cors());

// Middleware para parsear JSON en el cuerpo de las solicitudes
app.use(express.json());

// Configuramos la conexión a la base de datos MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Ruta para registrar un nuevo usuario
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8); // Encriptamos la contraseña

    // Insertamos el nuevo usuario en la base de datos
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.status(200).send({ message: '¡Usuario registrado exitosamente!' });
  } catch (err) {
    res.status(500).send('Error en el servidor.');
  }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscamos al usuario en la base de datos
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      res.status(404).send('Usuario no encontrado.');
      return;
    }

    const user = rows[0];
    const passwordIsValid = await bcrypt.compare(password, user.password); // Verificamos la contraseña
    if (!passwordIsValid) {
      res.status(401).send({ auth: false, token: null });
      return;
    }

    // Generamos el token JWT
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).send({ auth: true, token });
  } catch (err) {
    res.status(500).send('Error en el servidor.');
  }
});

// Middleware de autenticación
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).send({ auth: false, message: 'No se proporcionó token.' });
  }

  // Verificamos el token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Fallo al autenticar el token.' });
    }

    req.userId = decoded.id;
    next();
  });
};

// Ruta protegida para obtener información del usuario
app.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      res.status(404).send('Usuario no encontrado.');
      return;
    }

    res.status(200).send(rows[0]);
  } catch (err) {
    res.status(500).send('Error en el servidor.');
  }
});

// Iniciamos el servidor
app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto ${port}`);
});
    