import React from 'react';
import { BrowserRouter as Router, Routes, Route  } from 'react-router-dom';
import Login from './components/Login.js';
import Plantoes from './components/Plantoes.js';
import ConsultaPlantoes from './components/ConsultaPlantoes.js';
import Admin from './components/admin.js';
import Register from './components/register.js';
import Users from './components/users.js';
import PlantoesAdmin from './components/plantoesAdmin.js';
import Plantao24 from './components/plantao24.js';
const App = () => {
        return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/plantoes" element={<Plantoes />} />
                <Route path="/ConsultaPlantoes" element={<ConsultaPlantoes />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/registerfhsl" element={<Register />} />
                <Route path="/users" element={<Users/>} />
                <Route path='/plantoesAdmin' element={<PlantoesAdmin/>}/>
                <Route path='/plantao24' element={<Plantao24/>}/>

            </Routes>
        </Router>
    );
};

export default App;