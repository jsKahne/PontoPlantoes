// src/pages/Home.js
import React from 'react';
import Header from './header.js';
import './styles/admin.css';
import { LuUserPlus2 } from "react-icons/lu";
import { LuUser2 } from "react-icons/lu";
import { FaRegListAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


const Principal = () => {

    const navigate = useNavigate();

const handleNavigation = (path) => {
    navigate(path);

  };

return(
<div>
    <Header/>
<div className='container'>


    <div className='title-adm'>
        <h1 style={{ fontFamily: 'Arial, sans-serif', fontSize: '35px' }}>Administrador</h1>
        <div className='line1'></div>
    </div>
    <div className='container-menu' >
    <div className='card-admin' onClick={() => handleNavigation('/users')}>
        <LuUser2 className='cad-user'/>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}><strong>Usuários</strong></p>
    </div>
    <div className='card-admin'  onClick={() => handleNavigation('/registerfhsl')}>
        <LuUserPlus2 className='cad-user'/>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}><strong>Cadastro de usuário</strong></p>
    </div>
    <div className='card-admin' onClick={() => handleNavigation('/plantoesAdmin')}> 
        <FaRegListAlt className='cad-user'/>
        <p style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px' }}><strong>Consultar plantões</strong></p>
    </div>
  

    </div>
     </div>                   
</div>
     
    )

};

export default Principal;
