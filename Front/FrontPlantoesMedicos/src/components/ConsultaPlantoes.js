// src/ConsultaPlantoes.js
import React, { useEffect } from 'react';

import './styles/stylePlantao.css'; // Importando o arquivo CSS
import Header from './header';
import PlantoesListagem from './PlantoesListagem';




const ConsultaPlantoes = () => {



  useEffect(() => {
  }, []);

  
  return (
    <div className='container-plant'>
    <Header />
    <PlantoesListagem />
    </div>
        
  );
};

export default ConsultaPlantoes;