const { verify } = require('jsonwebtoken');
const authConfig = require('../configs/auth');

function ensureAuth(request, response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    console.log('Token não fornecido');
    return response.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decodedToken = verify(token, authConfig.jwtConfig.secret);
    const { userId } = decodedToken;
    if (!userId) {
      throw new Error('User ID não definido no token');
    }
    request.user = {
      id: Number(userId),
    };

    return next();
  } catch (error) {
    console.log('Erro ao verificar token:', error.message);
    return response.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = ensureAuth;
