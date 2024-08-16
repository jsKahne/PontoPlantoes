import React, { useEffect, useState } from 'react';
import api from '../api/config';
import './styles/header.css'; // Importando o arquivo CSS
import logo from './styles/img/logo-normal-verde.svg';
import configuracoes from './styles/img/gear-svgrepo-com.svg';
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
            />
             
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }} className='header-dados'>
              <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}className='header-span'>Bem-Vindo</span>
              <strong>{userName}</strong>
            </div>
            
          </div>
          
          <div className='configuracao-engrenagem'>
          <img
             src={configuracoes}
             className= 'logo-engrenagem' 
             alt="Engrenagem"
              onClick={toggleMenu} 
             />
            </div>
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
