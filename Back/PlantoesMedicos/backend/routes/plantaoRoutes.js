const express = require('express');
const ensureAuth = require('../middleware/ensureAuth.js');
const { 
    getPlantoesDia, 
    getListagemPlantoes, 
    obterEscalasAtivas, 
    iniciarPlantao, 
    finalizarPlantao, 
    getUserInfo, 
    logout, 
    adicionarPlantao, 
    getDadosAdicionarPlantao, 
    register 
} = require('../controllers/plantaoController.js');
const{
    getUsers,
    resetPassword,
    getPlantoes,
    updatePlantao,
    downloadPlantaoXLSX,
    downloadPlantaoMes,
    getPlantao24h,
    confirmarPlantao
} = require('../controllers/admin.js');

const router = express.Router();

router.get('/plantoes-dia', ensureAuth, getPlantoesDia);
router.get('/listagemPlantoes', ensureAuth, getListagemPlantoes);
router.post('/iniciar', ensureAuth, iniciarPlantao);
router.post('/finalizar', ensureAuth, finalizarPlantao);
router.get('/userinfo', ensureAuth, getUserInfo);
router.post('/logout', ensureAuth, logout);
router.get('/add_plantao_dados', ensureAuth, getDadosAdicionarPlantao);
router.post('/adicionar_plantao', ensureAuth, adicionarPlantao);
router.get('/obter_escalas', ensureAuth, obterEscalasAtivas);
router.post('/register', ensureAuth, register); 
router.get('/users', ensureAuth, getUsers);  
router.post('/reset-password', ensureAuth, resetPassword);  
router.get('/getPlantoes', getPlantoes);
router.put('/updatePlantoes', updatePlantao);
router.get('/plantoes/download', downloadPlantaoXLSX);
router.get('/plantoes/downloadMes', ensureAuth, downloadPlantaoMes);
router.get('/plantoes/plantoes24', ensureAuth,getPlantao24h);
router.post('/plantoes24/confirmar', confirmarPlantao);

module.exports = router;
