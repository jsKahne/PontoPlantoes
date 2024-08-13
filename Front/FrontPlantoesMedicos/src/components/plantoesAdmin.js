import React, { useState, useEffect } from 'react';
import api from '../api/config';
import { format } from 'date-fns';
import './styles/plantoesAdmin.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import Header from './header';

const PlantoesAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [plantoes, setPlantoes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDateInicial, setSelectedDateInicial] = useState('');
  const [selectedDateFinal, setSelectedDateFinal] = useState('');
  const [erro, setErro] = useState('');

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

  useEffect(() => {
    if (selectedUser) {
      fetchPlantoes();
    }
  }, [selectedUser, selectedDateInicial, selectedDateFinal]);

  return (
    <div className='Container-geral'>
        <Header/>
    <div className="plantoes-admin">
      <h1>Consulta de Plantões</h1>
      <div>
        <input
          type="text"
          placeholder="Pesquisar usuário"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearchUser}>Pesquisar Usuário</button>
      </div>

      <div>
        <h2>Usuários Encontrados</h2>
        {usuarios.length === 0 ? (
          <p>Não há usuários</p>
        ) : (
          <ul>
            {usuarios.map((usuario) => (
              <li key={usuario.cd_pessoa_fisica} onClick={() => setSelectedUser(usuario)}>
                {usuario.nm_usuario} ({usuario.nm_pessoa_fisica})
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedUser && (
        <div className="filters-container">
          <h2>Filtros de Data</h2>
          Data Inicial:
          <input
            type="date"
            value={selectedDateInicial}
            onChange={(event) => setSelectedDateInicial(event.target.value)}
          />
          Data Final:
          <input
            type="date"
            value={selectedDateFinal}
            onChange={(event) => setSelectedDateFinal(event.target.value)}
          />
          <button onClick={fetchPlantoes}>Consultar</button>
          {erro && <p style={{ color: 'red' }}>{erro}</p>}
        </div>
      )}

      <div className="cards-container">
        {plantoes.length === 0 ? (
          <p>Não há registros</p>
        ) : (
          <>
            <button onClick={handleDownload}>Baixar XLSX</button>
            {plantoes.map((plantao) => (
              <div className="card1" key={plantao.nr_sequencia}>
                <div className='titleCard'>
                  <h2>{plantao.escala_diaria}</h2>
                </div>
                <div className='conteudoCard'>
                  <p><strong>Data Inicial:</strong> {plantao.dt_inicial}</p>
                  <p><strong>Data Final:</strong> {plantao.dt_final}</p>
                  <p><strong>Status:</strong> {plantao.situacao}</p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default PlantoesAdmin;
