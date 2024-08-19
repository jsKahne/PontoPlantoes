// src/Menu.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Menu.css';
import logout from './styles/img/logout.svg';
import { jwtDecode } from 'jwt-decode';
import api from '../api/config';

const Menu = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const token = sessionStorage.getItem('token');
      console.log('Token encontrado no localStorage:', token); // Debug
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          console.log('Payload decodificado:', decodedToken); // Verifique o conteúdo do payload
          setIsAdmin(decodedToken.isAdmin === true); // Ajuste conforme o tipo de isAdmin
        } catch (error) {
          console.error('Erro ao decodificar token:', error);
        }
      }
    };

    checkAdminStatus();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };
  const handleLogout = async () => {
    try {
        const token = sessionStorage.getItem('token');
        await api.post('/api/logout', {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        sessionStorage.removeItem('token');
        window.location.href = '/login'; // Redireciona para a página de login
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
};

  return (
    <div className="menu-list">
      <button className="button" onClick={() => handleNavigation('/Plantoes')}>Plantões do dia</button>
      <div className="line3"></div>
      <button className="button" onClick={() => handleNavigation('/ConsultaPlantoes')}>Consultar plantões</button>
      <div className="line3"></div>
      
      {isAdmin && (
        <>
          <button className="button" onClick={() => handleNavigation('/plantoesAdmin')}>Gerenciar plantões</button>
      <div className="line3"></div>

          <button className="button" onClick={() => handleNavigation('/registerfhsl')}>Registrar usuário</button>
      <div className="line3"></div>

          <button className="button" onClick={() => handleNavigation('/admin')}>Painel administrador</button>
      <div className="line3"></div>
      <button className="button" onClick={() => handleNavigation('/plantao24')}>Plantoes 24H</button>
      <div className="line3"></div>

       </>
      )}
        <button className="logout" onClick={handleLogout}>
            <img src={logout} className='img-logout' alt="logout" />
          </button>
    </div>
  );
};

export default Menu;
