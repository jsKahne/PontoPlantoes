import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { format } from 'date-fns';
import './styles/plantoesAdmin.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Header from './header';
import LogoA from './styles/img/icon-512.png';

const PlantoesAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [plantoes, setPlantoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDateInicial, setSelectedDateInicial] = useState('');
  const [selectedDateFinal, setSelectedDateFinal] = useState('');
  const [erro, setErro] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Definir a data inicial e final como o primeiro e o último dia do mês passado
    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    setSelectedDateInicial(format(firstDayLastMonth, 'yyyy-MM-dd'));
    setSelectedDateFinal(format(lastDayLastMonth, 'yyyy-MM-dd'));
  }, []);

  const fetchUsuarios = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await api.get('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          name: searchTerm,
        },
      });
      setUsuarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      if (error.response && error.response.status === 404) {
        setUsuarios([]); // Set empty array to show "Nenhum usuário encontrado"
      }
    }
  };

  const fetchPlantoes = async () => {
    if (!selectedDateInicial || !selectedDateFinal) {
      setErro('Ambas as datas devem ser preenchidas.');
      return;
    }
    
    setPlantoes([]);
    setErro('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await api.get('/api/getPlantoes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          cd_medico: selectedUser.cd_pessoa_fisica,
          dataInicial: format(new Date(selectedDateInicial), 'yyyy-MM-dd'),
          dataFinal: format(new Date(selectedDateFinal), 'yyyy-MM-dd'),
        },
      });

      const plantoesFormatted = response.data.map((plantao) => ({
        ...plantao,
        dt_inicial_prev: format(new Date(plantao.dt_inicial_prev), 'dd/MM/yyyy HH:mm:ss'),
        dt_final_prev: format(new Date(plantao.dt_final_prev), 'dd/MM/yyyy HH:mm:ss'),
        dt_inicial: plantao.dt_inicial ? format(new Date(plantao.dt_inicial), 'dd/MM/yyyy HH:mm:ss') : 'Não iniciado',
        dt_final: plantao.dt_final ? format(new Date(plantao.dt_final), 'dd/MM/yyyy HH:mm:ss') : 'Não finalizado',
        situacao: plantao.dt_inicial && plantao.dt_final ? 'Realizado' : plantao.dt_inicial ? 'Não finalizado' : 'Não realizado',
      }));

      setPlantoes(plantoesFormatted);
    } catch (error) {
      console.error('Erro ao buscar plantões:', error);
      if (error.response && error.response.status === 404) {
        setErro('Nenhum plantão registrado no cadastro de plantões médicos.');
      }
    }
  };

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(plantoes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantões');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'plantoes.xlsx');
  };

  const handleSearchUser = () => {
    fetchUsuarios();
  };

  const handleUserClick = (usuario) => {
    setSelectedUser(usuario);
    // Definir as datas como o primeiro e o último dia do mês passado, se não estiver definido
    if (!selectedDateInicial || !selectedDateFinal) {
      const now = new Date();
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setSelectedDateInicial(format(firstDayLastMonth, 'yyyy-MM-dd'));
      setSelectedDateFinal(format(lastDayLastMonth, 'yyyy-MM-dd'));
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPlantoes([]);
    setErro('');
  };

  const handleModalSubmit = () => {
    fetchPlantoes();
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchPlantoes();
    }
  }, [selectedUser, selectedDateInicial, selectedDateFinal]);

  return (
    <div className='container-geral'>
      <Header />
      <div className="plantoes-admin">
        <div className='title'>
          <img src={LogoA} className="logo-title-admin" alt="Logo" />
          <h1>Consulta de Plantões</h1>
          <img src={LogoA} className="logo-title-admin" alt="Logo" />
        </div>
        <div className='line-admin'></div>

        <div className='users-found'>
          <h2>Usuários Encontrados</h2>
          <div className='usuarios'>
            <div className='pesquisa'>
              <label className="label">
                <span className="icon">
                  <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="1.25" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  className="input"
                  placeholder="Pesquisar nome"
                  autoComplete="off"
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
              </label>
              <button onClick={handleSearchUser} className="btn-custom">Pesquisar Usuário</button>
            </div>
            <div className='usuarios-encontrados'>
              {usuarios.length === 0 ? (
                <p className='not-found'>Nenhum usuário encontrado</p>
              ) : (
                <ul>
                  {usuarios.map((usuario) => (
                    <li key={usuario.cd_pessoa_fisica} onClick={() => handleUserClick(usuario)}>
                      <strong>{usuario.nm_pessoa_fisica}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button onClick={handleCloseModal} className="close-button">×</button>
              <div className="modal-header">
                <h2>Filtros de Data</h2>
              </div>
              <div className="modal-body">
                <div className="filters">
                  <label>
                    <p>Data Inicial:</p>
                    <input
                      type="date"
                      value={selectedDateInicial}
                      onChange={(event) => setSelectedDateInicial(event.target.value)}
                      className="input-date"
                    />
                  </label>
                  <label>
                    <p>Data Final:</p>
                    <input
                      type="date"
                      value={selectedDateFinal}
                      onChange={(event) => setSelectedDateFinal(event.target.value)}
                      className="input-date"
                    />
                  </label>
                  <button onClick={handleModalSubmit} className="btn-custom">Consultar</button>
                </div>
                {plantoes.length > 0 && (
                  <div><div className='download-xlsx'> 
                  <button onClick={handleDownload} className="btn-custom2">Baixar XLSX</button>
                  </div>
                  <div className="table-container">
                    <table className="plantoes-table">
                      <thead>
                        <tr>
                          <th>Escala Diária</th>
                          <th>Data Inicial</th>
                          <th>Data Final</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plantoes.map((plantao) => (
                          <tr key={plantao.cd_plantao}>
                            <td>{plantao.escala_diaria}</td>
                            <td>{plantao.dt_inicial_prev}</td>
                            <td>{plantao.dt_final_prev}</td>
                            <td>{plantao.situacao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div></div>
                )}
                {erro && <p className="error-message">{erro}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantoesAdmin;
