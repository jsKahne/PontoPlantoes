const express = require('express');
const cors = require('cors');
const app = express();
const { initialize } = require('./dbConfig');
const plantaoRoutes = require('./routes/plantaoRoutes');
const authRoutes = require('./routes/authRoutes');

// Inicializar Oracle Client
initialize();

// Configurar CORS
const corsOptions = {
<<<<<<< HEAD
  origin: ['http://localhost'], //'http://10.2.0.93', 'http://plantoes.fhsl.org.br', 'https://10.2.0.93']
=======
  origin: ['http://localhost:81'], //'http://10.2.0.93', 'http://plantoes.fhsl.org.br', 'https://10.2.0.93'],
>>>>>>> 7f59f00d25d6335341ef0187ad42e302bb7c9759
  credentials: true, // Permite o envio de cookies de autenticação (se houver)
};

app.use(cors(corsOptions));

// Outros middlewares
app.use(express.json());

// Usar rotas
app.use('/api', plantaoRoutes);
app.use('/auth', authRoutes);

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

