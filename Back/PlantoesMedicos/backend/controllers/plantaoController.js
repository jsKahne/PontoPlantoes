const { getConnection } = require('../dbConfig');
const bcrypt = require('bcrypt');
const { format, parse } = require('date-fns');

async function getPlantoesDia(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }
    
    const userId = req.user.id;
    const connection = await getConnection(); // Conectar ao banco de dados
    const query = `
      SELECT 
    cd_medico, 
    obter_nome_medico(cd_medico, 'N') AS nm_pessoa_fisica,
    dt_inicial_prev,
    dt_inicial,
    dt_final,
    nvl(obter_desc_escala(OBTER_ESCALA_DIARIA(nr_seq_escala_diaria)),obter_desc_tipo_plantao(nr_seq_tipo_plantao)) AS escala_diaria,
    NR_SEQUENCIA
FROM 
    MEDICO_PLANTAO
WHERE
    cd_medico = :userId
    AND (TO_CHAR(dt_inicial_prev, 'dd/mm/yyyy') = TO_CHAR(SYSDATE, 'dd/mm/yyyy') 
     OR 
     TO_CHAR(dt_inicial_prev, 'dd/mm/yyyy HH24') =  TO_CHAR(SYSDATE - 1, 'dd/mm/yyyy') || ' 19')
    ORDER BY dt_inicial
    `;
    const result = await connection.execute(query, { userId });

    const plantoes = result.rows.map(row => {
      const [
        cd_medico, 
        nm_pessoa_fisica, 
        dt_inicial_prev, 
        dt_inicial, 
        dt_final, 
        escala_diaria, 
        NR_SEQUENCIA
      ] = row;
      return { cd_medico, nm_pessoa_fisica, dt_inicial_prev, dt_inicial, dt_final, escala_diaria, NR_SEQUENCIA };
    });

    res.status(200).json(plantoes);
  } catch (error) {
    console.error('Erro ao obter plantões do dia:', error);
    res.status(500).json({ message: "Erro interno ao obter plantões do dia." });
  }
}

async function getListagemPlantoes(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const userId = req.user.id;
    const { dataInicial } = req.query;
    const {dataFinal }= req.query;
    console.log(userId);
    //console.log(dataInicial);
    //console.log(dataFinal);

    const connection = await getConnection(); // Conectar ao banco de dados
    const query = `
     select 
      a.cd_medico, 
      obter_nome_medico(a.cd_medico,'N') nm_pessoa_fisica,
      a.dt_inicial_prev,
      a.dt_final_prev,
      a.dt_inicial,
      a.dt_final,
      nvl(obter_desc_escala(OBTER_ESCALA_DIARIA(a.nr_seq_escala_diaria)),obter_desc_tipo_plantao(a.nr_seq_tipo_plantao)) AS escala_diaria,
      a.NR_SEQUENCIA,
      case when nr_seq_regra_esp is not null then rpa.vl_repassar else 0 end vl_repassar,
      case when dt_final is null then 'Pendente' else 'Finalizado' end status
      from medico_plantao a
      left join regra_esp_repasse rpa 
        on rpa.nr_sequencia = a.nr_seq_regra_esp
      where a.cd_medico = :userId
        and trunc(a.dt_inicial_prev) >= trunc(to_date(to_char(:dataInicial),'DD/MM/YYYY'))
        and trunc(a.dt_inicial_prev) <= trunc(to_date(to_char(:dataFinal),'DD/MM/YYYY'))
      order by a.dt_inicial `;
  
    const result = await connection.execute(query, [ userId ,dataInicial, dataFinal]);

    const plantoes = result.rows.map(row => {
      const [
        cd_medico, 
        nm_pessoa_fisica, 
        dt_inicial_prev, 
        dt_final_prev,
        dt_inicial, 
        dt_final, 
        escala_diaria, 
        NR_SEQUENCIA,
        vl_repassar,
        status
      ] = row;
      return { cd_medico, nm_pessoa_fisica, dt_inicial_prev,dt_final_prev, dt_inicial, dt_final, escala_diaria, NR_SEQUENCIA,vl_repassar,status };
    });

    res.status(200).json(plantoes);
  } catch (error) {
    console.error('Erro ao obter plantões do dia:', error);
    res.status(500).json({ message: "Erro interno ao obter plantões do dia." });
  }
}

async function getUserInfo(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }
  
      const userId = req.user.id;
      const connection = await getConnection(); // Conectar ao banco de dados
  
      // Consulta para obter informações do usuário
      const query = `
        SELECT 
          nm_pessoa_fisica
        FROM 
          pessoa_fisica
        WHERE
          cd_pessoa_fisica = :userId
      `;
  
      const result = await connection.execute(query, { userId });
  
      if (result.rows.length === 0) {
        await connection.close();
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
  
      const userInfo = result.rows[0];
      const  nm_pessoa_fisica  = userInfo[0];
  
      await connection.close();
  
      res.status(200).json({ nm_pessoa_fisica });
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
      res.status(500).json({ message: "Erro interno ao obter informações do usuário." });
    }
  }

async function iniciarPlantao(req, res) {
    const { plantaoId, password } = req.body;
   // Verificando o plantaoId recebido do frontend
  
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }
  
    const userId = req.user.id;
  
    try {
      const connection = await getConnection(); // Conectar ao banco de dados
  
      const checkPlantaoQuery = `SELECT COUNT(*) AS COUNT FROM MEDICO_PLANTAO WHERE cd_medico = :userId AND dt_final IS NULL`;
      const checkPlantaoResult = await connection.execute(checkPlantaoQuery, { userId });
  
      if (checkPlantaoResult.rows[0].COUNT > 0) {
        await connection.close();
        return res.status(400).json({ message: "Atenção! Você já tem um plantão iniciado." });
      }
  
      const userQuery = `SELECT ds_senha FROM FHSL_APP_TASY_USERS WHERE cd_pessoa_fisica = :userId`;
      const userResult = await connection.execute(userQuery, { userId });
  
      if (userResult.rows.length === 0) {
        await connection.close();
        return res.status(401).json({ message: "Usuário não encontrado." });
      }
  
      const user = userResult.rows[0];
      const passwordHash = user[0];
  
      // Verifica se a senha informada é correta
      const isPasswordMatch = await bcrypt.compare(password, passwordHash);
  
      if (!isPasswordMatch) {
        await connection.close();
        return res.status(401).json({ message: "Senha incorreta." });
      }
  
      const updatePlantaoQuery = `UPDATE MEDICO_PLANTAO SET dt_inicial = SYSDATE WHERE cd_medico = :userId AND NR_SEQUENCIA = :plantaoId`;
      await connection.execute(updatePlantaoQuery, { userId, plantaoId });
  
      await connection.commit();
      await connection.close();
  
      res.status(200).json({ message: "Plantão iniciado com sucesso." });
    } catch (error) {
      console.error('Erro ao iniciar plantão:', error);
      res.status(500).json({ message: "Erro interno ao iniciar plantão." });
    }
  }
  
  async function finalizarPlantao(req, res) {
    const { plantaoId, password } = req.body;
  
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }
  
    const userId = req.user.id;
  
    try {
      const connection = await getConnection(); // Conectar ao banco de dados
  
      const userQuery = `SELECT ds_senha FROM FHSL_APP_TASY_USERS WHERE cd_pessoa_fisica = :userId`;
      const userResult = await connection.execute(userQuery, { userId });
  
      if (userResult.rows.length === 0) {
        await connection.close();
        return res.status(401).json({ message: "Usuário não encontrado." });
      }
  
      const user = userResult.rows[0];
      const passwordHash = user[0]; // Corrigido para acessar DS_SENHA
  
      // Verifica se a senha informada é correta
      const isPasswordMatch = await bcrypt.compare(password, passwordHash);
  
      if (!isPasswordMatch) {
        await connection.close();
        return res.status(401).json({ message: "Senha incorreta." });
      }
  
      const updatePlantaoQuery = `UPDATE MEDICO_PLANTAO SET dt_final = SYSDATE, qt_minuto = ROUND((SYSDATE - dt_inicial) * 24 * 60)  WHERE cd_medico = :userId AND NR_SEQUENCIA = :plantaoId`;
      await connection.execute(updatePlantaoQuery, { userId, plantaoId });
  
      await connection.commit();
      await connection.close();
  
      res.status(200).json({ message: "Plantão finalizado com sucesso." });
    } catch (error) {
      console.error('Erro ao finalizar plantão:', error);
      res.status(500).json({ message: "Erro interno ao finalizar plantão." });
    }
  }
  async function logout(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }
  
      // Invalida o token removendo-o do lado do cliente
      // Você pode adicionar lógica adicional aqui para gerenciar tokens inválidos se necessário
      res.status(200).json({ message: "Logout realizado com sucesso." });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      res.status(500).json({ message: "Erro interno ao fazer logout." });
    }
  }
  async function adicionarPlantao(req, res) {
    try {
  
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }
  
      const { tipo } = req.body;
      const userId = req.user.id;
  
      const connection = await getConnection();
  
      const insertQuery = `
        INSERT INTO MEDICO_PLANTAO(cd_estabelecimento, nr_sequencia, cd_medico, dt_chamado, dt_inicial_prev, dt_final_prev, dt_inicial, nr_Seq_tipo_plantao, nr_seq_regra_esp, dt_atualizacao, nm_usuario, qt_minuto)
        VALUES (1, MEDICO_PLANTAO_SEQ.nextval, :cd_medico,
          CASE esus_obter_turno_data(SYSDATE)
            WHEN '1' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 06:00', 'DD/MM/YYYY HH24:MI')
            WHEN '2' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 12:00', 'DD/MM/YYYY HH24:MI')
            WHEN '3' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 18:00', 'DD/MM/YYYY HH24:MI')
            ELSE NULL
          END,
          CASE esus_obter_turno_data(SYSDATE)
            WHEN '1' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 07:00', 'DD/MM/YYYY HH24:MI')
            WHEN '2' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 13:00', 'DD/MM/YYYY HH24:MI')
            WHEN '3' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 19:00', 'DD/MM/YYYY HH24:MI')
            ELSE NULL
          END,
          CASE esus_obter_turno_data(SYSDATE)
            WHEN '1' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 12:59', 'DD/MM/YYYY HH24:MI')
            WHEN '2' THEN TO_DATE(TO_CHAR(SYSDATE, 'DD/MM/YYYY') || ' 18:59', 'DD/MM/YYYY HH24:MI')
            WHEN '3' THEN TO_DATE(TO_CHAR(SYSDATE + 1, 'DD/MM/YYYY') || ' 06:59', 'DD/MM/YYYY HH24:MI')
            ELSE NULL
          END,
          SYSDATE,
          (SELECT cd_tipo_plantao FROM fhsl_regras_plantoes_app WHERE plantao = :tipo AND cd_turno = CASE WHEN ds_titulo like '%24%' then '6' WHEN ds_titulo = 'G.O - Noturno - Final de semana' and hsl_obter_se_hora_especial_v2(sysdate) = 'FSN' THEN '5' WHEN hsl_obter_se_hora_especial_v2(sysdate) IN ('FS', 'F') and  esus_obter_turno_data(sysdate) in (1,2) then '4'    ELSE esus_obter_turno_data(sysdate) END),
          (SELECT nr_regra FROM fhsl_regras_plantoes_app WHERE plantao = :tipo AND cd_turno = CASE WHEN ds_titulo like '%24%' then '6' WHEN ds_titulo = 'G.O - Noturno - Final de semana' and hsl_obter_se_hora_especial_v2(sysdate) = 'FSN' THEN '5' WHEN hsl_obter_se_hora_especial_v2(sysdate) IN ('FS', 'F') and  esus_obter_turno_data(sysdate) in (1,2) then '4'    ELSE esus_obter_turno_data(sysdate) END),
          SYSDATE,
          obter_usuario_pf(:cd_pessoa_fisica),
          0)
      `;
  
      await connection.execute(insertQuery, { cd_medico: userId, tipo: tipo, cd_pessoa_fisica: userId });
      await connection.commit();
      await connection.close();
  
      res.status(200).json({ message: "Plantão adicionado com sucesso." });
    } catch (error) {
      console.error('Erro ao adicionar plantão:', error);
      res.status(500).json({ message: "Erro interno ao adicionar plantão." });
    }
  }
  

  async function getDadosAdicionarPlantao(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }
  
      const userId = req.user.id;
      const { tipo } = req.query; // Capturando tipo da query
  
      const connection = await getConnection(); // Conectar ao banco de dados
  
      const query = `
       SELECT
          obter_nome_medico(:userid, 'N')        AS nm_medico,
          to_char(
              CASE esus_obter_turno_data(sysdate)
                  WHEN '1' THEN
                      TO_DATE(to_char(sysdate, 'DD/MM/YYYY')
                              || ' 07:00',
                              'DD/MM/YYYY HH24:MI')
                  WHEN '2' THEN
                      TO_DATE(to_char(sysdate, 'DD/MM/YYYY')
                              || ' 13:00',
                              'DD/MM/YYYY HH24:MI')
                  WHEN '3' THEN
                      TO_DATE(to_char(sysdate, 'DD/MM/YYYY')
                              || ' 19:00',
                              'DD/MM/YYYY HH24:MI')
                 
                  ELSE
                      NULL
              END,
              'DD/MM/YYYY HH24:MI')          AS entrada_prev,
          to_char(
              CASE esus_obter_turno_data(sysdate)
                  WHEN '1' THEN
                      TO_DATE(to_char(sysdate, 'DD/MM/YYYY')
                              || ' 12:59',
                              'DD/MM/YYYY HH24:MI')
                  WHEN '2' THEN
                      TO_DATE(to_char(sysdate, 'DD/MM/YYYY')
                              || ' 18:59',
                              'DD/MM/YYYY HH24:MI')
                  WHEN '3' THEN
                      TO_DATE(to_char(sysdate + 1, 'DD/MM/YYYY')
                              || ' 06:59',
                              'DD/MM/YYYY HH24:MI')
                  ELSE
                      NULL
              END,
              'DD/MM/YYYY HH24:MI')          AS saida_prev,
          to_char(sysdate, 'DD/MM/YYYY HH24:MI') AS data_ini,
          CASE
                  WHEN :tipo = 'GO'    THEN
                      'G.O'
                  WHEN :tipo = 'Hkids' THEN
                      'PS KIDS'
                  WHEN :tipo = 'SP' THEN  
                      'Sala de Parto'
                  WHEN :tipo = 'ORT' THEN
                      'Ortopedia'
                 WHEN :tipo = 'UTI' THEN
                        ' U.T.I Geral '
                 WHEN :tipo = 'UTIPED' THEN
                        ' U.T.I Pediátrica '
                 WHEN :tipo = ' UTINEO ' THEN
                        ' U.T.I Neonatal '
                 WHEN :tipo = 'OTO' THEN
                        ' Otorrinolaringologista '
                 WHEN :tipo = 'OFT' THEN
                        'Oftalmologista'
                 WHEN :tipo = 'PS1' THEN
                        ' Pronto socorro 1º plantonista '
                 WHEN :tipo = 'PS2' THEN
                        ' Pronto socorro 2º plantonista '
                 WHEN :tipo = 'CCARD' THEN
                        ' Cirurgia cardiaca 24hrs '                        
                 WHEN :tipo = 'CIRPED' THEN
                        ' Cirurgia pediátrica 24hrs '
                 WHEN :tipo = 'CIRT' THEN
                        ' Cirurgia toráxica ' 
                 WHEN :tipo = 'CVAR' THEN
                        ' Cirurgia vascular '                     
          END
          || ' '
          ||
          CASE esus_obter_turno_data(sysdate)
                  WHEN '1' THEN
                      'Manhã'
                  WHEN '2' THEN
                      'Tarde'
                  WHEN '3' THEN
                      'Noite'
          END
          AS plantoes
      FROM
          dual
      `;
  
      const result = await connection.execute(query, { userid: userId, tipo: tipo });
  
      if (result.rows.length === 0) {
        await connection.close();
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
  
      const [plantaoAdicionar] = result.rows.map(row => ({
        nm_medico: row[0],
        entrada_prev: row[1],
        saida_prev: row[2],
        data_ini: row[3],
        plantoes: row[4]
      }));
  
      await connection.close();
  
      res.status(200).json(plantaoAdicionar);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
      res.status(500).json({ message: "Erro interno ao obter informações do usuário." });
    }
  }

  async function obterEscalasAtivas(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }
      const connection = await getConnection(); // Conectar ao banco de dados
  
      const query = `
        select ds_escala from escala where ie_situacao = 'A' and NR_SEQ_GRUPO = 61 order by 1
      `;
  
      const result = await connection.execute(query);
  
      if (result.rows.length === 0) {
        await connection.close();
        return res.status(404).json({ message: "Usuário não encontrado." });
      }
  
      const [escalaAtivas] = result.rows.map(row => ({
        ds_escala: row[0],
       
      }));
  
      await connection.close();
  
      res.status(200).json(escalaAtivas);
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
      res.status(500).json({ message: "Erro interno ao obter informações do usuário." });
    }
  }
  async function register(req, res) {
    try {
      // Verifica se o usuário está autenticado
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Usuário não autenticado." });
      }
  
      // Obtém os dados do request body
      const { cd_pessoa_fisica, nm_completo, nm_usuario } = req.body;
  
      // Verifica se todos os campos necessários foram fornecidos
      if (!cd_pessoa_fisica || !nm_completo || !nm_usuario ) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
      }
  
      const connection = await getConnection(); // Conectar ao banco de dados
  
      // Verifica se o usuário já existe
      const checkUserQuery = `SELECT COUNT(*) AS COUNT FROM FHSL_APP_TASY_USERS WHERE cd_pessoa_fisica = :cd_pessoa_fisica`;
      const checkUserResult = await connection.execute(checkUserQuery, { cd_pessoa_fisica });
  
      if (checkUserResult.rows[0].COUNT > 0) {
        await connection.close();
        return res.status(400).json({ message: "Usuário já registrado." });
      }

  
      // Insere o novo usuário na tabela
      const insertUserQuery = `
        INSERT INTO FHSL_APP_TASY_USERS (cd_pessoa_fisica, nm_pessoa_fisica, nm_usuario, ds_senha, ie_reset_senha)
        VALUES (:cd_pessoa_fisica, :nm_completo, :nm_usuario, :nm_usuario,1)
      `;
  
      await connection.execute(insertUserQuery, {
        cd_pessoa_fisica,
        nm_completo,
        nm_usuario,
      });
  
      await connection.commit(); // Commit na transação
      await connection.close(); // Fecha a conexão
  
      res.status(201).json({ message: "Usuário registrado com sucesso." });
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      res.status(500).json({ message: "Erro interno ao registrar usuário." });
    }
  }

 

  



  
  module.exports = {
    adicionarPlantao,
    getPlantoesDia,
    getListagemPlantoes,
    iniciarPlantao,
    finalizarPlantao,
    getUserInfo,
    getDadosAdicionarPlantao,
    logout,
    obterEscalasAtivas,
    register
  };
  
