import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://plantoes.fhsl.org.br:3000',  // Altere para a URL do seu servidor backend
  baseURL: 'http://localhost:3000',  // Altere para a URL do seu servidor backend
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptando as requisições para adicionar o cabeçalho de CORS
api.interceptors.request.use(
  (config) => {
    //config.headers['Access-Control-Allow-Origin'] = 'http://plantoes.fhsl.org.br';
<<<<<<< HEAD
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000';
=======
    config.headers['Access-Control-Allow-Origin'] = 'http://localhost:81';
>>>>>>> 7f59f00d25d6335341ef0187ad42e302bb7c9759
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
