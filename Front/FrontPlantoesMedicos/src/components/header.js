import React, { useEffect, useState } from 'react';
import api from '../api/config';
import './styles/header.css'; // Importando o arquivo CSS
import logout from './styles/img/logout.svg';
import logo from './styles/img/logo-normal-verde.svg';
import Menu from './Menu.js'

const Header = () => {
    const [userName, setUserName] = useState(''); // Estado para armazenar o nome do usuário
    const [menuOpen, setMenuOpen] = useState(false);
  
    useEffect(() => {
        fetchUserName();
    }, []);
  
    const fetchUserName = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await api.get('/api/userinfo', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
      
            if (response.data && response.data.nm_pessoa_fisica) {
                setUserName(response.data.nm_pessoa_fisica);
            } else {
                console.error('Dados do usuário não estão no formato esperado:', response.data);
            }
        } catch (error) {
            console.error('Erro ao buscar informações do usuário:', error);
        }
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

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };
  
    return (
      <div className='container-plant'>
        <div className='header-container'>
          <div className="profile">
            <img
              src={logo}
              className='img-profile'
              alt="Logo"
              onClick={toggleMenu} // Alterna o estado do menu ao clicar no logo
            />
  
            <div className='header-dados' onClick={toggleMenu}>
              <span className='header-span'>Bem-Vindo</span>
              <strong>{userName}</strong>
            </div>
            
          </div>
          <button className="logout" onClick={handleLogout}>
            <img src={logout} className='img-logout' alt="logout" />
          </button>
        </div>
        {menuOpen && (
          <div className="menu-container">
            <Menu />
          </div>
        )}
      </div>
    );
};

export default Header;
