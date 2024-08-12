const { getConnection } = require('../dbConfig');

async function getUsers(req, res) {
  let connection;
  try {
    connection = await getConnection();

    const query = `
      SELECT cd_pessoa_fisica, nm_usuario, nm_pessoa_fisica, ie_admin, dt_criacao, dt_atualizacao 
      FROM fhsl_app_tasy_users
      WHERE nm_pessoa_fisica LIKE :name
      ORDER BY 2
    `;
    const result = await connection.execute(query, { name: `%${req.query.name || ''}%` });

    await connection.close();

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Nenhum usuário encontrado." });
    }

    const users = result.rows.map(row => ({
      cd_pessoa_fisica: row[0],
      nm_usuario: row[1],
      nm_pessoa_fisica: row[2],
      ie_admin: row[3],
      dt_criacao: row[4],
      dt_atualizacao: row[5],
    }));

    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
    res.status(500).json({ message: "Erro interno ao buscar usuários." });
  }
}

async function resetPassword(req, res) {
  const { cd_pessoa_fisica } = req.body;
  if (!cd_pessoa_fisica) {
    return res.status(400).json({ message: "Informe o código da pessoa física." });
  }

  let connection;
  try {
    connection = await getConnection();

    const query = `
      UPDATE fhsl_app_tasy_users 
      SET ie_reset_senha = 1, ds_senha = (SELECT nm_usuario FROM fhsl_app_tasy_users WHERE cd_pessoa_fisica = :cd_pessoa_fisica)
      WHERE cd_pessoa_fisica = :cd_pessoa_fisica
    `;
    await connection.execute(query, { cd_pessoa_fisica }, { autoCommit: true });

    await connection.close();
    res.status(200).json({ message: "Senha resetada com sucesso." });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
    res.status(500).json({ message: "Erro interno ao resetar senha." });
  }
}

module.exports = {
  getUsers,
  resetPassword
};
