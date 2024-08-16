import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import './styles/plantoes24.css';
import Header from './header';
import api from '../api/config';

function Plantoes24() {
    const [plantoes, setPlantoes] = useState([]);
    const [tipoEscala, setTipoEscala] = useState('');
    const [dataMesAno, setDataMesAno] = useState('');
    const [erro, setErro] = useState('');

    const handleRadioChange = (event) => {
        setTipoEscala(event.target.value);
    };

    const handleDateChange = (event) => {
        setDataMesAno(event.target.value);
    };

    const fetchPlantoes = async () => {
        if (!tipoEscala || !dataMesAno) {
            setErro('Todos os campos devem ser preenchidos.');
            return;
        }
    
        setPlantoes([]);
        setErro('');
    
        const [ano, mes] = dataMesAno.split('-');
        const formattedDate = `${mes}/${ano}`;
    
        try {
            const token = sessionStorage.getItem('token');
    
            const response = await api.get('/api/plantoes/plantoes24', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    tipo_escala: tipoEscala,
                    mesAno: formattedDate
                }
            });
    
            const plantoesFormatted = response.data.map((plantao) => {
                const dt_inicio = plantao.dt_inicio ? parseISO(plantao.dt_inicio) : null;
                const dt_final = plantao.dt_fim ? parseISO(plantao.dt_fim) : null;
    
                return {
                    ...plantao,
                    dt_inicio: dt_inicio ? format(dt_inicio, 'dd/MM/yyyy HH:mm:ss') : 'Não iniciado',
                    dt_fim: dt_final ? format(dt_final, 'dd/MM/yyyy HH:mm:ss') : 'Não finalizado',
                    situacao: plantao.situacao || 'Pendente',
                };
            });
    
            setPlantoes(plantoesFormatted);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                setErro('Nenhum plantão encontrado para os critérios selecionados.');
            } else {
                console.error('Erro ao buscar plantões:', error);
                setErro('Erro ao buscar plantões. Verifique o console para mais detalhes.');
            }
        }
    };

    const confirmarPlantao = async (plantao) => {
        try {
            const token = sessionStorage.getItem('token');

            const dt_inicio = parseISO(plantao.dt_inicio);
            const dt_final = parseISO(plantao.dt_fim);

            if (!dt_inicio || !dt_final) {
                throw new Error('Datas inválidas fornecidas.');
            }

            await api.post('/api/plantoes24/confirmar', {
                nr_sequencia: plantao.nr_sequencia,
                cd_medico: plantao.cd_medico,
                dt_inicial: format(dt_inicio, 'yyyy-MM-dd HH:mm:ss'),
                dt_final: format(dt_final, 'yyyy-MM-dd HH:mm:ss'),
                tipo_escala: plantao.tipo_escala,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            fetchPlantoes();
        } catch (error) {
            console.error('Erro ao confirmar plantão:', error);
            setErro('Erro ao confirmar plantão.');
        }
    };

    return (
        <div>
            <Header />
            <h1>Consulta de Plantões 24h</h1>
            <div className="escala-selection">
                <label>
                    <input
                        type="radio"
                        name="tipoEscala"
                        value="OFT"
                        checked={tipoEscala === 'OFT'}
                        onChange={handleRadioChange}
                    />
                    Oftalmo
                </label>
                <label>
                    <input
                        type="radio"
                        name="tipoEscala"
                        value="CARD"
                        checked={tipoEscala === 'CARD'}
                        onChange={handleRadioChange}
                    />
                    Cirurgia Cardíaca
                </label>
                <label>
                    <input
                        type="radio"
                        name="tipoEscala"
                        value="PED"
                        checked={tipoEscala === 'PED'}
                        onChange={handleRadioChange}
                    />
                    Cirurgia Pediátrica
                </label>
            </div>

            <label>
                Mês/Ano:
                <input
                    type="month"
                    value={dataMesAno}
                    onChange={handleDateChange}
                />
            </label>

            <button onClick={fetchPlantoes}>Consultar</button>

            {erro && <p className="error-message">{erro}</p>}

            <div className="plantoes-list">
                {plantoes.length > 0 ? (
                    plantoes.map((plantao, index) => (
                        <div key={index} className="plantao-card">
                            <p>Nome: {plantao.nm_medico}</p>
                            <p>Tipo de Escala: {plantao.escala}</p>
                            <p> Dia da semana: {plantao.dia_semana}</p>
                            <p>Início: {plantao.dt_inicio}</p>
                            <p>Fim: {plantao.dt_fim}</p>
                            <p>Status: {plantao.situacao}</p>
                            {plantao.situacao !== 'Finalizado' && (
                                <button onClick={() => confirmarPlantao(plantao)}>
                                    Confirmar
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>Nenhum plantão encontrado.</p>
                )}
            </div>
        </div>
    );
}

export default Plantoes24;
