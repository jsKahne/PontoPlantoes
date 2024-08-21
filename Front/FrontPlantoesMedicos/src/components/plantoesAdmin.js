import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { format } from 'date-fns';
import './styles/plantoesAdmin.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Header from './header';
import LogoA from './styles/img/icon-512.png';
import { IoSearchOutline } from "react-icons/io5";

const PlantoesAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [plantoes, setPlantoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDateInicial, setSelectedDateInicial] = useState('');
  const [selectedDateFinal, setSelectedDateFinal] = useState('');
  const [selectedDateMesAno, setSelectedDateMesAno] = useState('');
  const [erro, setErro] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  useEffect(() => {
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

  const handleDownload = async () => {
    try {
      const token = sessionStorage.getItem('token');
      
      // Transformando o valor selecionado em "mm/yyyy"
      const formattedMesAno = format(new Date(selectedDateMesAno), 'MM/yyyy');
      
      const response = await api.get('/api/plantoes/downloadMes', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params: {
          mesAno: formattedMesAno,
        },
        responseType: 'arraybuffer',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `plantoes_${formattedMesAno}.xlsx`);
      setIsModalOpen2(false);
    } catch (error) {
      console.error('Erro ao baixar o arquivo XLSX:', error);
    }
  };

  const handleSearchUser = () => {
    fetchUsuarios();
  };

  const handleUserClick = (usuario) => {
    setSelectedUser(usuario);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPlantoes([]);
    setErro('');
  };

  const handleModalSubmit = () => {
    if (selectedUser && selectedDateInicial && selectedDateFinal) {
      fetchPlantoes();
    }
  };

  const handleOpenModal2 = () => {
    setIsModalOpen2(true);
  };

  const handleCloseModal2 = () => {
    setIsModalOpen2(false);
  };

  const exportTableToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(plantoes);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantões');
    XLSX.writeFile(wb, `plantoes_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className='container-geral'>
      <Header />
      <div className="plantoes-admin">
        <div className='title-plantao-admin'>
          <img src={LogoA} className="logo-title-admin" alt="Logo" />
          <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '30px' }}>Consulta de Plantões</h1>
          <img src={LogoA} className="logo-title-admin" alt="Logo" />
        </div>
        <div className='line-admin'></div>

        <div className='users-found'>
          <div className='usuarios'>
            <div className='pesquisa'>
              <label className="teste">
                <span className="icon">
                <IoSearchOutline/>
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
              <button style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }} onClick={handleSearchUser} className="btn-custom">Pesquisar Usuário</button>
              <button style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }} onClick={handleOpenModal2} className='btn-custom'>Download mensal</button>
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
                <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: '30px' }}>Filtros de Data</h2>
              </div>
              <div className="modal-body">
                <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px' }}>
                  Data Inicial:
                  <input className="data-inicio-filtro"
                    type="date"
                    value={selectedDateInicial}
                    onChange={(e) => setSelectedDateInicial(e.target.value)}
                  />
                </label>
                <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px' }}  >
                  Data Final:
                  <input className="data-fim-filtro"
                    type="date"
                    value={selectedDateFinal}
                    onChange={(e) => setSelectedDateFinal(e.target.value)}
                  />
                </label>
                {erro && <p className='erro'>{erro}</p>}
              </div>
              
              <div className="modal-footer">
                <button onClick={handleModalSubmit} className="btn-custom">Consultar</button>
                <button onClick={exportTableToExcel} className="btn-custom">Baixar Tabela XLSX</button>
              </div>

              {plantoes.length > 0 && (
                <div className="plantao-results">
                  <div className="table-container">
                    <table className="plantao-table">
                      <thead>
                        <tr className="tabela-filtro-datas">
                          <th>Data Inicial Prevista</th>
                          <th>Data Final Prevista</th>
                          <th>Data Inicial</th>
                          <th>Data Final</th>
                          <th>Situação</th>
                        </tr>
                      </thead>
                      <tbody className="tabela-filtro-plantoes">
                        {plantoes.map((plantao, index) => (
                          <tr className="tabela-filtro-campos" key={index}>
                            <td className="tabela-filtro-inicialprev">{plantao.dt_inicial_prev}</td>
                            <td className="tabela-filtro-finalprev">{plantao.dt_final_prev}</td>
                            <td className="tabela-filtro-inicial">{plantao.dt_inicial}</td>
                            <td className="tabela-filtro-final">{plantao.dt_final}</td>
                            <td className="tabela-filtro-situacao">{plantao.situacao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {isModalOpen2 && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button onClick={handleCloseModal2} className="close-button">×</button>
              <div className="modal-header">
                <h2 style={{ fontFamily: 'Arial, sans-serif', fontSize: '30px' }}>Download Mensal</h2>
              </div>
              <div className="modal-body">
                <label style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px' }}>
                  Selecione o mês:
                  <input
                    type="month"
                    value={selectedDateMesAno}
                    onChange={(e) => setSelectedDateMesAno(e.target.value)}
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button onClick={handleDownload} className="btn-custom">Baixar XLSX</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PlantoesAdmin;
