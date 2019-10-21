//definindo rotas que serao usadas no cadastro do usuario
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")  // biblioteca para hashear a senha
const passport = require("passport")

router.get("/registro", (req, res) =>{
  res.render("usuarios/registro")
})

// A diferença dessa classe para a classe de cima é o tipo, post vs get
router.post("/registro", (req, res) => {
  var erros = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
  }

  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
    erros.push({texto: "E-mail inválido"})
  }

  if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
    erros.push({texto: "Senha inválida"})
  }

  if(req.body.senha.length < 4){
    erros.push({texto: "Senha muito curta"})
  }
  if(req.body.senha != req.body.senha2){
    erros.push({texto: "As senhas são diferentes, tente novamente!"})
  }

  if(erros.length > 0){
    res.render("usuarios/registro", {erros: erros})
  }else{

    // Antes de cadastrar o usuario no banco de dados, vamos verificar se o mesmo ja não esta cadastrado.
    Usuario.findOne({email: req.body.email}).then((usuario) => {
      if(usuario){
        req.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema")
        res.redirect("/usuarios/registro")
      }else{
        const novoUsuario = new Usuario({
          nome: req.body.nome,
          email: req.body.email,
          senha: req.body.senha
        })

        // hasheando a senha
        // um gentSalt são valores aleatorios misturados com o hash da senha
        bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if(erro){
                req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                res.redirect("/")
              }
              // pegando o atributo senha do novo usuario e atribundo o hash que foi gerado
              novoUsuario.senha = hash

              novoUsuario.save().then(() => {
                req.flash("success_msg", "Usuário criado com sucesso!")
                res.redirect("/")
              }).catch((err) => {
                req.flash("error_msg","Houve um erro ao criar o usuário, tente novamente!")
                res.redirect("/usuarios/registro")
              })
            })
        })
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno")
      res.redirect("/")
    })
  }

})


router.get("/login", (req, res) => {
  res.render("usuarios/login")
})

// rota de login/autenticação
router.post("/login", (req, res, next) => {
  /*
     - authenticate => funcao sempre utilizada para autentificar
     - local => tipo de autenticação que configuramos
  */
  passport.authenticate("local", {
    // Se autenticar com sucesso
    successRedirect: "/",
    // Sem sucesso
    failureRedirect: "/usuarios/login",
    // mensagem de erro
    failureFlash: true
  })(req, res, next)
})

router.get("/logout", (req, res) => {
  req.logout()
  req.flash("success_msg", "Deslogado com sucesso!")
  res.redirect("/")
})

module.exports = router
