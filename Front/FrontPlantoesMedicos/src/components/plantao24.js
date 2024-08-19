import React, { useState } from 'react';
import { format, parseISO, parse, isValid } from 'date-fns';
import './styles/plantoes24.css';
import Header from './header';
import api from '../api/config';
<<<<<<< HEAD
=======
import { FaCheckCircle } from 'react-icons/fa';  // Importando o ícone de verificação
>>>>>>> 7f59f00d25d6335341ef0187ad42e302bb7c9759

function Plantoes24() {
    const [plantoes, setPlantoes] = useState([]);
    const [tipoEscala, setTipoEscala] = useState('');
    const [dataMesAno, setDataMesAno] = useState('');
    const [erro, setErro] = useState('');
    const [confirmado, setConfirmado] = useState(new Set()); // Estado para confirmar os plantões

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

    // Função auxiliar para converter data no formato 'dd/MM/yyyy HH:mm:ss' para o formato ISO
    const convertToISO = (dateString) => {
        const parsedDate = parse(dateString, 'dd/MM/yyyy HH:mm:ss', new Date());
        return isValid(parsedDate) ? format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss") : null;
    };

    const confirmarPlantao = async (plantao) => {
        const convertToCustomFormat = (dateString) => {
            // Define o formato esperado
            const formatString = 'dd/MM/yyyy HH:mm:ss';
            
            // Faz o parsing da data usando o formato esperado
            const parsedDate = parse(dateString, formatString, new Date());
            
            // Verifica se a data é válida e formata para o formato desejado
            return isValid(parsedDate) ? format(parsedDate, formatString) : null;
        };

        try {
            const token = sessionStorage.getItem('token');

            // Converte as datas para o formato especificado
            const dt_inicioFormatted = convertToCustomFormat(plantao.dt_inicio);
            const dt_finalFormatted = convertToCustomFormat(plantao.dt_fim);

            if (!dt_inicioFormatted || !dt_finalFormatted) {
                throw new Error('Datas inválidas fornecidas.');
            }

            // Cria o corpo da solicitação
            const requestBody = {
                tipo_escala: plantao.tipo_escala,
                cd_medico: plantao.cd_pessoa_fisica,
                dt_inicio: dt_inicioFormatted, // Data formatada conforme especificado
                dt_final: dt_finalFormatted, // Data formatada conforme especificado
            };

            console.log('Enviando request body:', requestBody);

            await api.post('/api/plantoes24/confirmar', requestBody, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Atualiza o estado para incluir o plantão confirmado
            setConfirmado(new Set([...confirmado, plantao.cd_pessoa_fisica, plantao.mesAno]));
            fetchPlantoes();
        } catch (error) {
            if (error.response) {
                console.error('Erro ao confirmar plantão:', error.response.data);
                setErro(`Erro ao confirmar plantão: ${error.response.data.message || 'Erro desconhecido'}`);
            } else {
                console.error('Erro ao confirmar plantão:', error);
                setErro('Erro ao confirmar plantão.');
            }
        }
    };

    return (
        <div>
<<<<<<< HEAD
                        <Header />
            <h1>Consulta de Plantões 24h</h1>

            <div>
                {erro && <p className="msg-erro-plantao24h">{erro}</p>}
            </div>

            <label className="filtro-pesquisa">
                Mês/Ano: 
=======
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
>>>>>>> 7f59f00d25d6335341ef0187ad42e302bb7c9759
                <input
                    type="month"
                    value={dataMesAno}
                    onChange={handleDateChange}
                />
<<<<<<< HEAD
                <button onClick={fetchPlantoes}>Consultar</button>
            </label>
                <div className= "selecao-plantao">
                    <div className="menu-plantoes">
                        <div className="selecao-escala">
                            <label className='oftalmo24h'>
                                <input
                                type="radio"
                                name="tipoEscala"
                            value="OFT"
                            checked={tipoEscala === 'OFT'}
                            onChange={handleRadioChange}
                            />
                            Oftalmologia
                             </label>
                            <label className='cardiaca24h'>
                             <input
                                type="radio"
                                name="tipoEscala"
                                value="CARD"
                                checked={tipoEscala === 'CARD'}
                                onChange={handleRadioChange}
                            />
                            Cirurgia Cardíaca
                            </label>
                            <label className='pediatria24h'>
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
                    </div>
                </div>
=======
            </label>

            <button onClick={fetchPlantoes}>Consultar</button>

            {erro && <p className="error-message">{erro}</p>}
>>>>>>> 7f59f00d25d6335341ef0187ad42e302bb7c9759

            <div className="plantoes-list">
                {plantoes.length > 0 ? (
                    plantoes.map((plantao, index) => (
                        <div 
                            key={index} 
                            className={`plantao-card ${confirmado.has(plantao.cd_pessoa_fisica) ? 'confirmed' : ''}`}
                        >
                            <p>Nome: {plantao.nm_medico}</p>
                            <p>Tipo de Escala: {plantao.escala}</p>
                            <p>Dia da semana: {plantao.dia_semana}</p>
                            <p>Início: {plantao.dt_inicio}</p>
                            <p>Fim: {plantao.dt_fim}</p>
                            <p>Status: {plantao.situacao}</p>
                            {plantao.situacao !== 'Finalizado' && (
                                <button onClick={() => confirmarPlantao(plantao)}>
                                    Confirmar
                                </button>
                            )}
<<<<<<< HEAD
=======
                            <FaCheckCircle className="check-icon" />
>>>>>>> 7f59f00d25d6335341ef0187ad42e302bb7c9759
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
