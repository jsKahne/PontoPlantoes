import React, { useState } from 'react';
import './styles/styleRegister.css';
import Header from './header.js';
import api from '../api/config'; // Certifique-se de que o caminho está correto
import logoMin from './styles/img/logo-normal-verde.svg';

const Register = () => {
  const [cd_pessoa_fisica, setCd_pessoa_fisica] = useState('');
  const [nm_completo, setNm_completo] = useState('');
  const [nm_usuario, setNm_usuario] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      const response = await api.post('/api/register', {
        cd_pessoa_fisica,
        nm_completo,
        nm_usuario
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setSuccess('Usuário registrado com sucesso.');
        setError(''); // Limpar mensagem de erro, se houver
      } else {
        setError(response.data.message || 'Erro ao registrar.');
        setSuccess(''); // Limpar mensagem de sucesso, se houver
      }
    } catch (error) {
      console.error('Erro ao registrar:', error.response?.data || error.message || error);
      setError('Erro interno ao registrar.');
      setSuccess(''); // Limpar mensagem de sucesso, se houver
    }
  };

  return (
    <div className="register-container">
      <Header />
      <div className="register-container1">
        <form className="form" onSubmit={handleRegister}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }} className='center-title'>
            <p className="title">
              <img src={logoMin} className="logo" alt="Logo"  /> Registrar Plantonista
            </p>
          </div>
          <label>
            <input
              required
              type="text"
              className="input"
              value={cd_pessoa_fisica}
              onChange={(e) => setCd_pessoa_fisica(e.target.value)}
            />
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>Código Pessoa Física</span>
          </label>

          <label>
            <input
              required
              type="text"
              className="input"
              value={nm_completo}
              onChange={(e) => setNm_completo(e.target.value)}
            />
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>Nome Completo</span>
          </label>

          <label>
            <input
              required
              type="text"
              className="input"
              value={nm_usuario}
              onChange={(e) => setNm_usuario(e.target.value)}
            />
            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>Usuário Tasy</span>
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
