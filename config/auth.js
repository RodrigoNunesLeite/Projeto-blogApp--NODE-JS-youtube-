// estruturando a parte de autentificação
const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// model do usuario
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){
  //usernameField = indica o campo que vamos utilizar
  passport.use(new localStrategy({usernameField: 'email', passwordField:"senha"}, (email, senha, done) => {
    Usuario.findOne({email: email}).then((usuario) => {
      if(!usuario){
        // done é uma funcao de callback
        /*
          No node passamos 3 parametros:
           a conta, se foi autentificado ou não e a mensagem de erro
        */
        return  done(null, false, {message: "Esta conta não existe"})
      }
      /*
        Compara a senha digitada com a senha do usuario encontrada
      */
      bcrypt.compare(senha, usuario.senha, (erro, batem) => {
        if(batem){
          return done(null, usuario)
        }else {
          return done(null, false, {message: "Senha incorreta"})
        }
      })
    })
  }))

 // passando os dados do usuario para uma sessao
  // inicio
  passport.serializeUser((usuario, done) => {
    done(null, usuario.id)
  })

  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
      done(err, usuario)
    })
  })
  // fim
}
