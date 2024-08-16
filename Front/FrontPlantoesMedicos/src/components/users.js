import React, { useState, useEffect } from 'react';
import api from '../api/config';
import Header from './header.js';
import './styles/userList.css'; 
import { IoSearchOutline } from "react-icons/io5";
import { CgClose } from "react-icons/cg";


function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [noUsersFound, setNoUsersFound] = useState(false); // Estado para gerenciar mensagem de usuário não encontrado

  useEffect(() => {
    fetchUsers();
  }, //[searchTerm]
);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await api.get('/api/users', {
        params: { name: searchTerm },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.length === 0) {
        setNoUsersFound(true);
      } else {
        setNoUsersFound(false);
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      if (error.response && error.response.status === 401) {
        alert('Sessão expirada. Por favor, faça login novamente.');
      } else if (error.response && error.response.status === 404) {
        setNoUsersFound(true);
        setUsers([]);
      }
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };

  const handleResetPassword = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await api.post('/api/reset-password', 
        { cd_pessoa_fisica: selectedUser.cd_pessoa_fisica },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Senha resetada com sucesso.');
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      alert('Erro ao resetar senha.');
    }
  };

  return (
    <div>
      <Header/>
      
      <div className="user-list-container">
        <h1>Gerenciamento de Usuários</h1>
        <label className="label">
          <IoSearchOutline className="icon"/>
          <input
            type="text"
            className="input"
            placeholder="Pesquisar nome"
            autoComplete="off"
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </label>
        <table className="user-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Usuário</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {noUsersFound ? (
              <tr>
                <td colSpan="3">Nenhum usuário encontrado.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.cd_pessoa_fisica} onClick={() => handleUserClick(user)}>
                  <td><strong>{user.nm_pessoa_fisica}</strong></td>
                  <td><strong>{user.nm_usuario}</strong></td>
                  <td><strong>{user.ie_admin ? 'Sim' : 'Não'}</strong></td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {selectedUser && (
          <div className="user-details-overlay">
            <div className="user-details">
              <div className="closebtn"> 
            <CgClose className='close-button1'  onClick={() => setSelectedUser(null)}/>
            </div>
              <h3 style={{ fontFamily: 'Arial, sans-serif', fontSize: '20px' }}>Detalhes do Usuário</h3>
              <p>Nome: {selectedUser.nm_pessoa_fisica}</p>
              <p><strong>Usuário:</strong> {selectedUser.nm_usuario}</p>
              <p><strong>Admin:</strong> {selectedUser.ie_admin ? 'Sim' : 'Não'}</p>
              <p><strong>Data de Criação:</strong> {selectedUser.dt_criacao}</p>
              <p><strong>Data de Atualização:</strong> {selectedUser.dt_atualizacao}</p>
              <div className="buttons">
                <button className="reset-button" onClick={handleResetPassword}>Resetar Senha</button>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserList;
