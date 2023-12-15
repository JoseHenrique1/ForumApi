import express from 'express';
import cors from 'cors';

//Database e Models
import sequelize from './database/db.js';
import Usuario from './models/usuario.js';
import Tema from './models/tema.js';
import Comentario from './models/comentario.js';
import Resposta from './models/resposta.js';

Usuario.hasMany(Tema);
Usuario.hasMany(Comentario);
Usuario.hasMany(Resposta);
Tema.hasMany(Comentario);
Comentario.hasMany(Resposta);

sequelize.sync();


const app = express();
const port = 3000 || 8000;
//habilita a api a ser reconhecida como segura pelo navegador
app.use(cors());
//poder pegar o body das requisicoes
app.use(express.json());

 
app.post('/cadastro',async (req, res) => {
    let nome = req.body.nome;
    let email = req.body.email;
    let senha = req.body.senha;
    await Usuario.create({
        nome: nome,
        email: email,
        senha: senha,
    })
    
    res.json({msg:"success"});
})

app.post('/autenticacao',async (req, res) => { //checar se estão vazios, DEPOISchecar se o email e senha é de algum usuario
    let email = req.body.email;
    let senha = req.body.senha;
    let usuario = Usuario.findOne({
        where: {
            email: email,
            senha: senha
        }
    })
    usuario = JSON.parse(JSON.stringify(usuario, null, 2));

    //checar se é null ou nao
    res.json({menssage: 'success', id: usuario.id})
})

app.get('/temas',async (req, res) => {
    const temas = await Tema.findAll();
    res.send(temas);
})

app.post('/temas',async (req, res) => {
    await Tema.create({
        conteudo: req.body.conteudo,
        usuarioId: Number(req.body.usuarioId)
    })
    res.json({msg:"success"});
})

app.get('/interacoes/:temaId',async (req, res) => {
    let tema_id_req = Number(req.params.temaId);
    let comentarios = await Comentario.findAll({
        where: {
            temaId: tema_id_req, 
        }
    });
    comentarios = JSON.parse(JSON.stringify(comentarios, null, 2));

    let ids_comentarios = await comentarios.map((comentario)=>comentario.id);
    let promessas = ids_comentarios.map((item)=>(Resposta.findAll({
        where:{comentarioId:item}
    })))
    const respostas = await Promise.all(promessas)
    .then(data=>JSON.stringify(data, null, 2))
    .then(data=>JSON.parse(data));

    comentarios = await comentarios.map((item, index)=>{
        return {...item, respostas: respostas[index]}
    })
       
    res.json(comentarios);
})  


app.listen(port, () => {
  console.log(`Api rodando ${port}`);
})
