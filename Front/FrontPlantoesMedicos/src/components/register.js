import React, { useState } from 'react';
import './styles/styleRegister.css';
import Header from './header.js';
import api from '../api/config'; // Certifique-se de que o caminho está correto
import logoMin from './styles/img/icon-512.png';

const Register = () => {
  const [cd_pessoa_fisica, setCd_pessoa_fisica] = useState('');
  const [nm_completo, setNm_completo] = useState('');
  const [nm_usuario, setNm_usuario] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/api/register', {
        cd_pessoa_fisica,
        nm_completo,
        nm_usuario
      });

      if (response.status === 201) {
        setSuccess('Registro bem-sucedido. Redirecionando para login...');
      } else {
        setError(response.data.message || 'Erro ao registrar.');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setError('Erro interno ao registrar.');
    }
  };

  return (
    <div className="register-container">
      <Header />
      <div className="register-container1">
        <form className="form" onSubmit={handleRegister}>
          <div className='center-title'>
          
            <p className="title"><img src={logoMin} className="logo" alt="Logo" /> Registrar Plantonista</p>
          </div>
          <label>
            <input
              required
              type="text"
              className="input"
              value={cd_pessoa_fisica}
              onChange={(e) => setCd_pessoa_fisica(e.target.value)}
            />
            <span>Código Pessoa Física</span>
          </label>

          <label>
            <input
              required
              type="text"
              className="input"
              value={nm_completo}
              onChange={(e) => setNm_completo(e.target.value)}
            />
            <span>Nome completo</span>
          </label>

          <label>
            <input
              required
              type="text"
              className="input"
              value={nm_usuario}
              onChange={(e) => setNm_usuario(e.target.value)}
            />
            <span>Usuário Tasy</span>
          </label>


          <button type="submit" className="submit"><strong>Registrar</strong></button>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
