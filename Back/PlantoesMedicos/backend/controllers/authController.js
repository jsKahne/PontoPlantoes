const bcrypt = require('bcrypt');
const { getConnection } = require('../dbConfig');
const jwt = require('jsonwebtoken');
const { jwtConfig } = require("../configs/auth");

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Informe usuário e senha." });
  }
  let connection;
  try {
    connection = await getConnection();

    const lowerUsername = username.toLowerCase();
    const query = `SELECT cd_pessoa_fisica, NM_USUARIO, ds_senha, ie_reset_senha, ie_admin FROM FHSL_APP_TASY_USERS WHERE LOWER(nm_usuario) = :lowerUsername`;
    const result = await connection.execute(query, { lowerUsername });

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(401).json({ message: "Usuário não encontrado." });
    }

    const user = result.rows[0];
    const passwordHash = user[2];
    const resetPassword = user[3];

    const isPasswordMatch = await bcrypt.compare(password, passwordHash);

    if (resetPassword !== null && password === username) {
      await connection.close();
      return res.json({ token: null, resetPassword: true });
    }

    if (!isPasswordMatch) {
      await connection.close();
      return res.status(401).json({ message: "Senha incorreta." });
    }

    const payload = {
      userId: user[0],
      username: user[1],
      isAdmin: user[4] === 1, // Converte para booleano
    };

    const token = jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });

    await connection.close();

    res.json({ token, resetPassword: false });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
    res.status(500).json({ message: "Erro interno ao fazer login." });
  }
}

async function resetPassword(req, res) {
  const { username, newPassword } = req.body;
  if (!username || !newPassword) {
    return res.status(400).json({ message: "Informe o nome de usuário e a nova senha." });
  }

  if (!/\d/.test(newPassword)) {
    return res.status(400).json({ message: "A nova senha deve conter pelo menos um número." });
  }

  let connection;
  try {
    connection = await getConnection();

    const lowerUsername = username.toLowerCase();
    const query = `SELECT cd_pessoa_fisica FROM FHSL_APP_TASY_USERS WHERE LOWER(nm_usuario) = :lowerUsername`;
    const result = await connection.execute(query, { lowerUsername });

    if (result.rows.length === 0) {
      await connection.close();
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const userId = result.rows[0][0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateQuery = `UPDATE FHSL_APP_TASY_USERS SET ds_senha = :hashedPassword, ie_reset_senha = null, dt_atualizacao = sysdate WHERE cd_pessoa_fisica = :userId`;
    await connection.execute(updateQuery, { hashedPassword, userId }, { autoCommit: true });

    await connection.close();
    res.status(200).json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error('Erro ao alterar a senha:', error);
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
    res.status(500).json({ message: "Erro interno ao alterar a senha." });
  }
}

module.exports = {
  login,
  resetPassword
};
