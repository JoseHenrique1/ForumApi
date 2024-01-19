import 'dotenv/config.js'
import express from 'express';
import cors from 'cors';

import { Op } from 'sequelize';

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
const port = Number(process.env.PORT);
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

app.get('/usuarios',async (req, res) => { //checar se estão vazios, DEPOISchecar se o email e senha é de algum usuario
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
    await Tema.create({
        conteudo: req.body.conteudo,
        usuarioId: Number(req.body.usuarioId)
    })
    res.json({msg:"success"});
})


app.get('/comentarios',async (req, res) => {
    if (req.query.temaId && req.query.pageNumber) {
        let temaId = req.query.temaId;
        let pageNumber = Number(req.query.pageNumber);
        let usuarioId = req.query.usuarioId

        let comentariosPublicos = await Comentario.findAll({
            where: {
                temaId,
                usuarioId: {
                    [Op.ne]: usuarioId
                }
            },
            offset: pageNumber*5,
            limit: 5
        });

        comentariosPublicos = JSON.parse(JSON.stringify(comentariosPublicos, null, 2));

        let ids_usuarios = comentariosPublicos.map(item=>item.usuarioId);

        let usuarios_promises = ids_usuarios.map((id_usuario)=>{
            return Usuario.findOne({where:{id:id_usuario}})
        })

        let usuarios =await Promise.all(usuarios_promises)
        .then(data=>JSON.stringify(data, null, 2))
        .then(data=>JSON.parse(data));

        comentariosPublicos = comentariosPublicos.map((comentario, index)=>{
            return {...comentario, usuario: usuarios[index]}
        })

        //Comentarios pessoais (usuario autenticado no momento)

        let comentariosPessoais = await Comentario.findAll({
            where: {
                temaId,
                usuarioId: usuarioId
            },
        });

        comentariosPessoais = JSON.parse(JSON.stringify(comentariosPessoais, null, 2));

        let usuario = await Usuario.findOne({where:{id:usuarioId}});

        comentariosPessoais = comentariosPessoais.map((comentario)=>{
            return {...comentario, usuario}
        })


        res.json({msg: "success", comentariosPublicos, comentariosPessoais});
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
    if (req.query.comentarioId && req.query.pageNumber) {
        let comentarioId = req.query.comentarioId;
        let pageNumber = Number(req.query.pageNumber);
        let usuarioId = req.query.usuarioId;

        let respostasPublicas = await Resposta.findAll({
            where: {
                comentarioId,
                usuarioId: {
                    [Op.ne]: usuarioId
                }
            },
            offset: pageNumber*5,
            limit: 5
        });

        respostasPublicas = JSON.parse(JSON.stringify(respostasPublicas, null, 2));

        let ids_usuarios = respostasPublicas.map(item=>item.usuarioId);

        let usuarios_promises = ids_usuarios.map((id_usuario)=>{
            return Usuario.findOne({where:{id:id_usuario}})
        })

        let usuarios = await Promise.all(usuarios_promises)
        .then(data=>JSON.stringify(data, null, 2))
        .then(data=>JSON.parse(data));

        respostasPublicas = respostasPublicas.map((comentario, index)=>{
            return {...comentario, usuario: usuarios[index]}
        })

        //Respostas pessoais (usuario autenticado no momento)

        let respostasPessoais = await Resposta.findAll({
            where: {
                comentarioId,
                usuarioId: usuarioId
            },
        });

        respostasPessoais = JSON.parse(JSON.stringify(respostasPessoais, null, 2));

        let usuario = await Usuario.findOne({where:{id:usuarioId}});

        respostasPessoais = respostasPessoais.map((resposta)=>{
            return {...resposta, usuario}
        })

        res.json({msg: "success", respostasPublicas, respostasPessoais});
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
