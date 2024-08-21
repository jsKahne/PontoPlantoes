import React, { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import api from '../api/config.js';
import './styles/stylePlantao.css'; // Importando o arquivo CSS
import logo from './styles/img/logo-normal-verde.svg';
import { BsClipboard2Check } from "react-icons/bs";
import Header from './header.js';
const ListPlantoes = () => {
  const [plantoes, setPlantoes] = useState([]);
  const [selectedPlantao, setSelectedPlantao] = useState(null);
  const [password, setPassword] = useState('');
  const [modalOpen, setModalOpen] = useState(false); // Estado para controlar a abertura do modal
  const [modaladdOpen,setModaladdOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [passwordError, setPasswordError] = useState(false); // Estado para controlar a exibição do erro de senha
  const [showCard, setShowCard] = useState(false); // Estado para controlar a visibilidade do card selecionado
  const [plantaoAdicionar, setPlantaoAdicionar] = useState(null);
  const [selectedPlantaoType, setSelectedPlantaoType] = useState('');

  const plantaoStatusRef = useRef(null); // Referência para o elemento plantao-status
  const modalRef = useRef(null); // Referência para o modal

  useEffect(() => {
    fetchPlantoes();
  }, []);

  const fetchPlantoes = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await api.get('/api/plantoes-dia', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const plantoesFormatted = response.data.map((plantao) => ({
        ...plantao,
        dt_inicial_prev: format(new Date(plantao.dt_inicial_prev), 'dd/MM/yyyy HH:mm:ss'),
        dt_inicial: plantao.dt_inicial ? format(new Date(plantao.dt_inicial), 'dd/MM/yyyy HH:mm:ss') : 'Não iniciado',
        dt_final: plantao.dt_final ? format(new Date(plantao.dt_final), 'dd/MM/yyyy HH:mm:ss') : 'Não finalizado',
        finalizado: plantao.dt_inicial && plantao.dt_final ? true : false,
      }));

      setPlantoes(plantoesFormatted);
    } catch (error) {
      console.error('Erro ao buscar plantões:', error);
    }
  };

  const handleSelectPlantao = (plantao) => {
    // Verifica se o plantão selecionado é o mesmo que já está selecionado
    if (selectedPlantao === plantao) {
      setSelectedPlantao(null); // Deseleciona o plantão
      setShowCard(false); // Oculta o card selecionado
    } else {
      setSelectedPlantao(plantao); // Seleciona o novo plantão
      setShowCard(true); // Mostra o card selecionado
    }
  
    // Scroll suave até o plantao-status
    if (plantaoStatusRef.current) {
      plantaoStatusRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const handleIniciarPlantao = async () => {
    if (!selectedPlantao) {
      return alert('Selecione um plantão.');
    }
  
    setActionType('iniciar');
    setModalOpen(true); // Abre o modal ao iniciar o plantão
  
    // Scroll suave até o modal
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFinalizarPlantao = async () => {
    if (!selectedPlantao) {
      return alert('Selecione um plantão.');
    }

    if (selectedPlantao.dt_inicial === 'Não iniciado') {
      return alert('Você não pode finalizar um plantão que não foi iniciado.');
    }

    setActionType('finalizar');
    setModalOpen(true); // Abre o modal ao finalizar o plantão

    // Scroll suave até o modal
    if (modalRef.current) {
      modalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const endpoint = actionType === 'iniciar' ? '/api/iniciar' : '/api/finalizar';
      const plantaoId = selectedPlantao.NR_SEQUENCIA;

      // Verifica se a senha foi informada
      if (!password) {
        alert('Por favor, informe sua senha.');
        return;
      }

      const response = await api.post(endpoint, {
        plantaoId,
        password,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(`Resposta recebida: ${response.data.message}`);

      alert(response.data.message);
      setModalOpen(false); // Fecha o modal após o submit
      fetchPlantoes();
      setSelectedPlantao(null); // Deseleciona o plantão após a ação
      setPassword(''); // Limpa a senha após o submit
      setActionType(''); // Limpa o tipo de ação
      setPasswordError(false); // Limpa o erro de senha
      setShowCard(false); // Oculta o card selecionado
    } catch (error) {
      console.error(`Erro ao ${actionType === 'iniciar' ? 'iniciar' : 'finalizar'} plantão:`, error);
      if (error.response && error.response.status === 401) {
        // Senha incorreta
        setPasswordError(true);
      }
    }
  };


  const handleAdicionarPlantao = () => {
    setModaladdOpen(true); // Abre o modal para adicionar plantão
  };

  const handleSelectPlantaoType = async (event) => {
    const plantaoType = event.target.value;
    setSelectedPlantaoType(plantaoType);
  
    if (!plantaoType) {
      setPlantaoAdicionar(null);
      return;
    }
  
    try {
      const token = sessionStorage.getItem('token');
      const response = await api.get('/api/add_plantao_dados', {
        params: { tipo: plantaoType }, // Passando tipo como parte dos parâmetros da query
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data) {
        setPlantaoAdicionar(response.data);
      } else {
        console.error('Dados do plantão para adicionar não foram obtidos corretamente:', response);
        alert('Erro ao obter informações do plantão para adicionar.');
      }
    } catch (error) {
      console.error('Erro ao obter dados do plantão para adicionar:', error);
      alert('Erro ao obter informações do plantão para adicionar.');
    }
  };

  const handleConfirmarAdicao = async () => {
  if (!selectedPlantaoType) {
    return alert('Selecione um tipo de plantão.');
  }

  try {
    const token = sessionStorage.getItem('token');
    const response = await api.post('/api/adicionar_plantao', {
      tipo: selectedPlantaoType
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    alert(response.data.message);
    setModaladdOpen(false);
    setSelectedPlantaoType('');
    setPlantaoAdicionar(null);
    fetchPlantoes();
  } catch (error) {
    console.error('Erro ao adicionar plantão:', error);
    alert('Erro ao adicionar plantão.');
  }
};
  

  return (
    <div className='container-plant'>
    <Header />  
        <div className="div-center">
        <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '30px' }}> Plantões do Dia</h1>

        <div className='line-plantao'></div>

        <div className='add-plantao-container'>
          <button className="add-plantao" onClick={handleAdicionarPlantao}>
            Adicionar Plantão
          </button>
        </div>
        <div className='line'></div>
        <div className="list-Plantoes">
          {plantoes.length === 0 ? (
            <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px' }} className="no-plantoes">Não há plantões disponíveis para o usuário hoje!</p>
          ) : (
            <ul>
              {plantoes.map(plantao => (
                <li key={plantao.NR_SEQUENCIA} className="plantao-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedPlantao === plantao}
                      onChange={() => handleSelectPlantao(plantao)}
                    />
                    <span className="checkmark"></span>
                    <div className="plantao-info">
                      <h3>Data: {plantao.dt_inicial_prev} - {plantao.escala_diaria}</h3>
                    </div>
                  </label>
                </li>
              ))}
              




            </ul>
          )}
        </div>
        <div className='line'></div>
        {showCard && selectedPlantao && (
          <div className='card-plantao-selecionado'>
            <div className='conteudo-card' ref={plantaoStatusRef}>
              <h2  style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px' }}>Plantão Selecionado</h2>
              <div className='line2'> </div>
              <h3><p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>Doutor: {selectedPlantao.nm_pessoa_fisica}</p></h3>
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}><strong>Início do plantão:</strong> {selectedPlantao.dt_inicial}</p>
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}><strong>Fim do plantão:</strong> {selectedPlantao.dt_final}</p>
              <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}><strong>Plantão:</strong> {selectedPlantao.escala_diaria}</p>

              <div className='line2'> </div>
            </div>
            {selectedPlantao.finalizado ? (
              <div className="plantao-status">
                <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}><h3>Esse plantão já foi finalizado.</h3></span>
                <button className="ok-button" onClick={() => { setShowCard(false); setSelectedPlantao(null); }}>OK</button>
              </div>
            ) : (
              <div className="action-buttons">
                <button
                  className="action-button"
                  onClick={handleIniciarPlantao}
                  disabled={selectedPlantao.dt_inicial !== 'Não iniciado'}
                >
                  Iniciar Plantão
                </button>
                <button
                  className="action-button"
                  onClick={handleFinalizarPlantao}
                  disabled={selectedPlantao.dt_final !== 'Não finalizado' || selectedPlantao.dt_inicial === 'Não iniciado'}
                >
                  Finalizar Plantão
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      {modalOpen && (
  <div className="modal" ref={modalRef}>
    <div className="modal-content">
      <span className="close" onClick={() => setModalOpen(false)}>&times;</span>
      <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px' }}>Confirme sua Senha</h2>
      <div className="input-container">
        <label htmlFor="password"></label>
        <input
          id="password"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(); // Chama a função handleSubmit ao pressionar "Enter"
            }
          }}
        />
        {passwordError && (
          <div className="error-message">Senha incorreta</div>
        )}
      </div>
      <button className="confirm-button" onClick={handleSubmit}>Confirmar</button>
    </div>
  </div>
)}
{modaladdOpen && (
  <div className="modal-card" ref={modalRef}>
    <div className="modal-content2">
      <span className="close" onClick={() => setModaladdOpen(false)}>&times;</span>
      <div className="modal-header">
        <img src={logo} className="modal-logo" alt="Logo" />
        <h3>Dados do plantão</h3>
        <div className="line3"></div>
      </div>
      <div className="modal-body">
        <div className="select-modal-add">
          <label className='label-add'>
            <p><strong>Selecione o tipo de plantão:</strong></p>
            <p>
              <select className="custom-select" value={selectedPlantaoType} onChange={handleSelectPlantaoType} required>
                <option value="">Selecione...</option>
                <option value="GO">Ginecologia e Obstetricia</option>
                <option value="Hkids">Hkids</option>
                <option value="ORT">Ortopedia</option>
                <option value="SP">Sala de parto</option>
                <option value="UTI">U.T.I Geral</option>
                <option value="UTIPED">U.T.I Pediátrica</option>
                <option value="UTINEO">U.T.I Neonatal</option>
                <option value="OTO">Otorrinolaringologista</option>
                <option value="OFT">Oftalmologista</option>
                <option value="PS1">Pronto socorro 1º plantonista</option>
                <option value="PS2">Pronto socorro 2º plantonista</option>
                <option value="CCARD">Cirurgia cardiaca 24hrs</option>
                <option value="CIRPED">Cirurgia pediátrica 24hrs</option>
                <option value="CIRT">Cirurgia toráxica</option>
                <option value="CVAR">Cirurgia vascular</option>
              </select>
            </p>
          </label>
        </div>
        {plantaoAdicionar && (
          <div className="conteudo-card-add-plantao">
            <p><strong>Médico:</strong></p>
            <input type="text" value={plantaoAdicionar.nm_medico} disabled />
            <p><strong>Entrada Prevista:</strong></p>
            <input type="text" value={plantaoAdicionar.entrada_prev} disabled />
            <p><strong>Saída Prevista:</strong></p>
            <input type="text" value={plantaoAdicionar.saida_prev} disabled />
            <p><strong>Data de Início:</strong></p>
            <input type="text" value={plantaoAdicionar.data_ini} disabled />
            <p><strong>Plantão:</strong></p>
            <input type="text" value={plantaoAdicionar.plantoes} disabled />
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="confirm-button" onClick={handleConfirmarAdicao}>Confirmar</button>
        <button className="cancel-button" onClick={() => setModaladdOpen(false)}>Cancelar</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default ListPlantoes;
