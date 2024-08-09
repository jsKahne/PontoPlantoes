const oracledb = require('oracledb');

const dbConfig = {
  user: "tasy",
  password: "aloisk",
  //connectString: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=racscan.fhsl.org.br)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=dbfund)))'
  connectString: '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=10.2.0.14)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=dbteste)))'
};

async function initialize() {
  try {
    await oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_21_13' }); // Diretório onde o Instant Client do Oracle está instalado
    console.log("Oracle Client inicializado com sucesso.");
  } catch (err) {
    console.error('Erro ao inicializar o Oracle Client:', err.message);
    throw err;
  }
}

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log("Conexão Oracle bem-sucedida.");
    return connection;
  } catch (err) {
    console.error('Erro ao conectar ao banco de dados Oracle:', err.message);
    throw err;
  }
}

module.exports = { initialize, getConnection };
