// src/Menu.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Menu.css';
import { jwtDecode } from 'jwt-decode';

const Menu = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = () => {
      const token = localStorage.getItem('token');
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

  return (
    <div className="menu-list">
      <button className="button" onClick={() => handleNavigation('/Plantoes')}>Plantões do Dia</button>
      <button className="button" onClick={() => handleNavigation('/ConsultaPlantoes')}>Consulta Plantões</button>
      
      {isAdmin && (
        <>
          <button className="button" onClick={() => handleNavigation('/ConsultaPlantoesAdmin')}>Consultar Plantões Admin</button>
          <button className="button" onClick={() => handleNavigation('/registerfhsl')}>Registrar Usuário</button>
          <button className="button" onClick={() => handleNavigation('/admin')}>Admin Page</button>
        </>
      )}
    </div>
  );
};

export default Menu;
