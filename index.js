// importar o servidor express
const express = require("express");
// iportart o modulo do cors
const cors = require("cors");
// iportart o modulo do mysql2
const mysql = require("mysql2");
// iportart o modulo do helmet
const helmet = require("helmet");
// iportart o modulo do morgan
const morgan = require("morgan");
// importar o modulo de criptografia de senhas bcrypt
const bcrypt = require("bcrypt");


// Carregandos os modulos para a execução no backend 
const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

//configurações de conexão com o banco de dados mysql
const con = mysql.createConnection({
    host:"127.0.0.1",
    port:"3306",
    user:"root",
    password:"",
    database:"dbexpress"
});


// endpoint para acesso
app.get("/",(req,res)=>{
    // obter os clientes que estão dacastrados no banco de dados
    con.query("Select * from clientes", (error, result)=>{
        if(error){
            return res.status(500).send({msg: `Erro ao tentar selecionar os clientes. ${error}`});

        } 
        res.status(200).send({payload:result});
    })
});

app.post("/cadastro",(req,res)=>{

    bcrypt.hash(req.body.senha,10,(error, novaSenha)=>{
        if(error){
            return res.status(500).send({msg:`Erro ao tentar cadastrar, tente novamente`});
        } else{
            // Vamos devolcer a seha para o body porem a senha esta criptografada
            req.body.senha = novaSenha;

    con.query("INSERT INTO clientes set ?", req.body,(error, result)=>{
        if(error){
            return res.status(400).send({msg:`Erro ao tentar cadastrar. ${error}`});
        }
        res.status(201).send({msg:`Cliente cadastrado`,payload:result})
    })
}
})

});

app.put("/atualizar/:id",(req,res)=>{
    if(req.params.id==0 || req.params.id==null){
        return res.status(400).send({msg: `Você precisa mandar o id do cliente`})
    }
    con.query("update clientes set ? where id=?", [req.body, req.params.id],(error, result)=>{
        if(error){
            return res.status(500).send({msg: `Erro ao tentar atualizar ${error}`});
        }
        res.status(200).send({msg: `Cliente atualizado`, payload:result})
    })



});




app.delete("/apagar/:id",(req,res)=>{
    if(req.params.id==0 || req.params.id==null){
        return res.status(400).send({msg: `Você precisa mandar o id do cliente`});
    }
    con.query("Delete from clientes where id=?",req.params.id, (error, result)=>{
        if(error){
            return res.status(500).send({msg: `Erro ao tentar apagar ${error}`});
        }
        res.status(204).send({msg: `Cliente deletado`})
    })
});


//
app.post("/login", (req, res) => {
    con.query("SELECT * FROM clientes WHERE usuario = ?", req.body.usuario, (error, result) => {
        if (error) {
            return res.status(500).send({ msg: `Erro ao tentar logar: ${error}` });
        } else if (result[0] == null) {
            return res.status(400).send({ msg: `Usuário ou senha errada.` });
        } else {
            bcrypt.compare(req.body.senha, result[0].senha).then((igual) => {
                if (!igual) {
                    res.status(400).send({ msg: `Usuário ou senha errada.` });
                } else {
                    res.status(200).send({ msg: `Usuário logado` });
                }
            }).catch(() => res.status(500).send({ msg: `Erro na verificação da senha.` }));
        }
    });
});

app.listen(8000,()=>console.log("Servidor online"))