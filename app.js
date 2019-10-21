//Carregando módulos
  const express = require('express')
  const handlebars = require('express-handlebars')
  const bodyParser = require('body-parser')
  const app = express()
  /*
   Constante para chamar o arquivo que contem as rotas,
   normalmente damos a constante o mesmo nome do arquivo
  */
  const admin = require('./routes/admin')

  // modulo path, nativo do node para manipular pastas
  const path = require('path')
  const mongoose = require('mongoose')
  const session = require('express-session')
  // O flash é um tipo de sessão que aparece uma unica vez, quando recarrega a página, o mesmo some.
  const flash = require('connect-flash')
  require("./models/Postagem")
  const Postagem = mongoose.model("postagens")
  require("./models/Categoria")
  const Categoria = mongoose.model("categorias")
  const usuarios = require('./routes/usuario')
  const passport = require("passport")
  require("./config/auth")(passport)
  const db = require("./config/db")
// Configurações
  // Configurando a sessão
    //** app.use server para criação e utilização de middleware
    app.use(session({
      // parametros para a criação do objeto
      // chave para gerar a sessão, pode colocar qualquer coisa
      secret: "cursodenode",
      resave: true,
      saveUninitialized: true
    }))

    // muito importante os comandos abaixo virem logo apos a criação da sessão
    app.use(passport.initialize())
    app.use(passport.session())

    //configurando o flah, deve ficar abaixo da sessão
    app.use(flash())

  // configurando o middleware para trabalhar com sessão
    app.use((req, res, next) => {
      // declarando variaveis globais
      // O comando locals serve para criar variaveis globais
      // success_msg é o nome da variavel global
      res.locals.success_msg = req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      res.locals.error = req.flash("error")
      /*
        - req.user = o passport cria automaticamente armazenando dados dos usuarios logados
        - res.locals.user = esta recebendo os dados do usuario logado
      */
      res.locals.user = req.user || null;
      next()
    })
  // Body PArser
    app.use(bodyParser.urlencoded({extended:true}))
    app.use(bodyParser.json())
  // Handlebars
    app.engine('handlebars',handlebars({defaultLayout: 'main'}))
    app.set('view engine','handlebars');
  // Mongoosse
    mongoose.Promise = global.Promise;
    //mongoose.connect("mongodb://localhost/bloqapp").then(() => {
    mongoose.connect(db.mongoURI).then(() => {
      console.log("Conectado ao mongo")
    }).catch((err) => {
      console.log("Erro ao se conectar: "+err)
    })

  // Public
    // Dizendo ao express que o pasta public esta guardando nossos arquivos estaticos
    // __ para pegar o caminho absoluto da pasta public
    app.use(express.static(path.join(__dirname,'public')))

    // middlewares
    /*
    app.use((req, res, next)=> {
      console.log('Oi eu sou um middleware')
      next()
    })
   */
// Rotas
    // boa pratica chamar as rotas sempre abaixo das configuraçoes
   // nesse caso, o /admin se torna o prefixo das rotas dentro do arquivo
   // exemplo, teria que digitar http://localhost:8081/admin/post
    app.use('/admin', admin)
    app.use('/usuarios',usuarios)
  // definir uma rota no proprio arquivo e sem prefixo
    /*
    app.get('/posts',(req, res) => {
      res.send('lista de posts')
    })
    */
    app.get("/", (req, res) => {
      Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens})
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
      })

    })

    app.get("/postagem/:slug", (req, res) => {
      Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem){
          res.render("postagem/index", {postagem: postagem})
        }else{
          req.flash("error_msg", "Esta postagem não existe")
          res.redirect("/")
        }
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
      })
    })



    app.get("/categorias", (req, res) => {
      Categoria.find().then((categorias) => {
          res.render("categorias/index", {categorias: categorias})
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias")
        res.redirect("/")
      })
    })

    app.get("/categorias/:slug", (req, res) => {
      // encontrando um categoria que tenha o slug igual ao slug dos parametros
      Categoria.findOne({slug: req.params.slug}).then((categoria) => {
        if(categoria){
          // procura pelos posts que tenham aquela categoria
          Postagem.find({categoria: categoria._id}).then((postagens) => {
            res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
          }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar os posts!")
            res.redirect("/")
          })
        }else{
          req.flash("error_msg", "Esta categoria não existe")
          res.redirect("/")
        }
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a pagina desta categoria")
        res.redirect("/")
      })
    })

    app.get("/404", (req, res) => {
      res.send("Erro 404!")
    })


// Outros
//const PORT = 8081
// para pegar a porta aleatoria do heroku
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
  console.log("Servidor Rodando!")
})
