import React, { useEffect, useState } from 'react';
import './styles/PlantoesListagem.css';
import api from '../api/config.js';
import { format } from 'date-fns';

const PlantoesListagem = () => {
  const getFirstDayOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const getLastDayOfMonth = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 1, 0);
  };

  const formatDate = (date) => {
    return format(date, 'yyyy-MM-dd');
  };   

  const formataBarra = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const firstDay = getFirstDayOfMonth();
  const lastDay = getLastDayOfMonth();
  const formattedFirstDay = formatDate(firstDay);
  const formattedlastDay = formatDate(lastDay);
  const [plantoes, setPlantoes] = useState([]);
  const [selectedDateInicial, setSelectedDateInicial] = useState(formattedFirstDay);
  const [selectedDateFinal, setSelectedDateFinal] = useState(formattedlastDay);
  const [erro, setErro] = useState('');

  // Função para buscar os dados
  const fetchPlantoes = async () => {
    setPlantoes([]);

    if (selectedDateInicial > selectedDateFinal) {
      setErro('A data inicial não pode ser maior que a data final.');
    } else {
      setErro(''); // Limpar a mensagem de erro se a validação for bem-sucedida
      try {
        const token = sessionStorage.getItem('token');
        const response = await api.get('/api/listagemPlantoes', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          params: { dataInicial: formataBarra(selectedDateInicial), dataFinal: formataBarra(selectedDateFinal) }, // Envia a data como parâmetro
        });
  
        const plantoesFormatted = response.data.map((plantao) => ({
          ...plantao,
          dt_inicial_prev: format(new Date(plantao.dt_inicial_prev), 'dd/MM/yyyy HH:mm:ss'),
          dt_final_prev: format(new Date(plantao.dt_final_prev), 'dd/MM/yyyy HH:mm:ss'),
          dt_inicial: plantao.dt_inicial ? format(new Date(plantao.dt_inicial), 'dd/MM/yyyy HH:mm:ss') : 'Não iniciado',
          dt_final: plantao.dt_final ? format(new Date(plantao.dt_final), 'dd/MM/yyyy HH:mm:ss') : 'Não finalizado',
          finalizado: plantao.dt_inicial && plantao.dt_final ? true : false,
        }));
  
        setPlantoes(plantoesFormatted);
      } catch (error) {
        console.error('Erro ao buscar plantões:', error);
      }
    }
  };

  useEffect(() => {
    fetchPlantoes(); // Chamando a função para buscar os dados ao montar o componente
  }, []); // Dependência vazia significa que o efeito só será executado uma vez após a montagem do componente

  return (
    <div className="user-list">
      <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '30px' }}>Consulta de Plantões</h1>

      <div className='line-plantao-consulta'></div>

      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px' }}>
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
        <button onClick={fetchPlantoes}>
          Consultar
        </button>
        {erro && <p style={{ color: 'red' }}>{erro}</p>}
      </div>
      
<div className="cards-container">
  {plantoes.length === 0 ? (
    <p className="text-left">Não há registros</p>
  ) : (
    plantoes.map((plantao) => (
      <div className="card1" key={plantao.NR_SEQUENCIA}>
        <div className="titleCard">
          <h2 className="text-left" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
            {plantao.escala_diaria}
          </h2>
        </div>
        <div className="conteudoCard">
          <p className="text-left" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
            <strong>Data Inicial:</strong> {plantao.dt_inicial}
          </p>
          <p className="text-left" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
            <strong>Data Final:</strong> {plantao.dt_final}
          </p>
          <p className="text-left" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
            <strong>Status:</strong> {plantao.status}
          </p>
        </div>
      </div>
    ))
  )}
</div>

    </div>
  );
};

export default PlantoesListagem;
