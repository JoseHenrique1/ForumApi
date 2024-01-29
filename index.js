import 'dotenv/config.js'
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
const port = Number(process.env.PORT) || 3000;
//habilita a api a ser reconhecida como segura pelo navegador
app.use(cors());
//poder pegar o body das requisicoes
app.use(express.json());

 
app.post('/usuarios',async (req, res) => {
    let nome = req.body.nome;
    let email = req.body.email;
    let senha = req.body.senha;
    let usuario = await Usuario.findOne({
        where: {
            email: email
        }
    })
    if (!usuario) {
        await Usuario.create({
            nome: nome,
            email: email,
            senha: senha,
        })
        
        res.json({msg:"success"});
    }
    else {
        res.json({msg:"error"});
    }
})

app.get('/usuarios',async (req, res) => { 
    if (req.query.email && req.query.senha) {
        let email = req.query.email;
        let senha = req.query.senha;
        let usuario = await Usuario.findOne({
            where: {
                email: email,
                senha: senha
            }
        })
        if (usuario!==null) {
            usuario = JSON.parse(JSON.stringify(usuario, null, 2));
            res.json({msg: 'success', user: usuario})
        }
        else {res.json({msg: 'error'})}  
    }
    else {
        let usuarios = await Usuario.findAll();
        res.json({msg: 'success', usuarios})
    }
       
})

app.get('/temas',async (req, res) => {
    const temas = await Tema.findAll();
    res.send(temas);
})

app.get('/temas/:temaId',async (req, res) => {
    const tema = await Tema.findOne(
        {where: {id:req.params.temaId}
    });
    
    res.send(tema?tema:{});
})

app.post('/temas',async (req, res) => {
    let tema = await Tema.create({
        conteudo: req.body.conteudo,
        usuarioId: Number(req.body.usuarioId)
    });
    console.log(tema)
    res.json({msg:"success", tema});
})


app.get('/comentarios',async (req, res) => {
    if (req.query.temaId) {
        let temaId = req.query.temaId;

        let comentarios = await Comentario.findAll({
            where: {
                temaId,
            },
            order: [
                ['id','DESC']
            ]
        });

        comentarios = JSON.parse(JSON.stringify(comentarios, null, 2));

        let ids_usuarios = comentarios.map(item=>item.usuarioId);

        let usuarios_promises = ids_usuarios.map((id_usuario)=>{
            return Usuario.findOne({where:{id:id_usuario}})
        })

        let usuarios =await Promise.all(usuarios_promises)
        .then(data=>JSON.stringify(data, null, 2))
        .then(data=>JSON.parse(data));

        comentarios = comentarios.map((comentario, index)=>{
            return {...comentario, usuario: usuarios[index]}
        })

        res.json({msg: "success", comentarios});
    }
    else {
        let comentarios = await Comentario.findAll();
        comentarios = JSON.parse(JSON.stringify(comentarios, null, 2));
        res.json({msg: "success", comentarios});
    }
    
})

app.post('/comentarios',async (req, res) => {
    let comentario = await Comentario.create({
        mensagem: req.body.mensagem,
        usuarioId: Number(req.body.usuarioId),
        temaId: Number(req.body.temaId)
    })
    comentario =  JSON.parse(JSON.stringify(comentario, null, 2));
    res.json({msg:"success", comentario});
})

app.get('/respostas',async (req, res) => {
    if (req.query.comentarioId) {
        let comentarioId = req.query.comentarioId;

        let respostas = await Resposta.findAll({
            where: {
                comentarioId,
            },
            order: [
                ['id','DESC']
            ]
        });

        respostas = JSON.parse(JSON.stringify(respostas, null, 2));

        let ids_usuarios = respostas.map(item=>item.usuarioId);

        let usuarios_promises = ids_usuarios.map((id_usuario)=>{
            return Usuario.findOne({where:{id:id_usuario}})
        })

        let usuarios = await Promise.all(usuarios_promises)
        .then(data=>JSON.stringify(data, null, 2))
        .then(data=>JSON.parse(data));

        respostas = respostas.map((comentario, index)=>{
            return {...comentario, usuario: usuarios[index]}
        })

        res.json({msg: "success", respostas});
    }
    else {
        let respostas = await Resposta.findAll();
        respostas = JSON.parse(JSON.stringify(respostas, null, 2));
        res.json({msg: "success", respostas});
    }
    
})

app.post('/respostas',async (req, res) => {
    let resposta = await Resposta.create({
        mensagem: req.body.mensagem,
        usuarioId: Number(req.body.usuarioId),
        comentarioId: Number(req.body.comentarioId)
    })
    resposta =  JSON.parse(JSON.stringify(resposta, null, 2));
    res.json({msg:"success", resposta});
})


app.listen(port, () => {
  console.log(`Api rodando http://localhost:${port}/`);
})
