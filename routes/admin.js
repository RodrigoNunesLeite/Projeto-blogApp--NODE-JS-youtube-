const express = require('express')
// componente usado para criar rotas em arquivos separados
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model("postagens")
// Pega a funcao eAdmin do eAdmin.js
const {eAdmin} = require("../helpers/eAdmin")
// definindo rotas

/*
 quando se usa a rota em outro arquivo, chama o
 router.algo ao inves do app.algo
*/

router.get('/', eAdmin, (req, res) => {
  //res.send('Página principal do painel ADM')
  res.render('admin/index')
})

// para exibir, digitar http://localhost:8081/admin/post
router.get('/posts', eAdmin, (req, res) => {
  res.send('Página de posts')
})

router.get('/categorias', eAdmin,(req, res)=>{
  // Listando todos os documentos que existem na collection
  Categoria.find().sort({date:'desc'}).then((categorias) => {
    //Categoria.find().then((categorias) => {
      //res.render('admin/categorias')
      res.render('admin/categorias', {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias")
    res.redirect("/admin")
  })

})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  // findOne = busca apenas 1 registro
  Categoria.findOne({_id:req.params.id}).then((categoria) =>{
    res.render("admin/editcategorias",{categoria: categoria})
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect("/admin/categorias")
  })

})

router.post("/categorias/edit", eAdmin, (req, res) => {

  // pesquisa uma categoria que tem o id, igual o campo de name id do formulario
  // A palavra categoria em minusculo, recebe o valor da Categoria, e ai usamos ele como referencia para manipular os dados
  Categoria.findOne({_id: req.body.id}).then((categoria) => {
      // vai pegar a categoria que queremos editar e atribuir o valor do campo nome do formulario
      categoria.nome = req.body.nome
      categoria.slug = req.body.slug

      categoria.save().then(() => {
        req.flash("success_msg", "Categoria editada com sucesso")
        res.redirect("/admin/categorias")
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
        res.redirect("/admin/categorias")
      })

  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao editar a categoria")
    res.redirect("/admin/categorias")
  })
})

router.post('/categorias/nova', eAdmin, (req, res) => {
  // Validaçao manual de formulário
  var erros = []

  // Verificando se o nome é vazio, indefinido ou nulo
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    // Todo array tem a função .push, serve para colocar um novo dado no array
    erros.push({texto: "Nome inválido"})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Slug inválido"})
  }

  if(req.body.nome.length < 2){
    erros.push({texto: "Nome da categoria muito pequeno"})
  }

  // Verificando se existe mais de um erro
  if(erros.length > 0){
    // atraves do render é possivel passar dados para a view
    res.render("admin/addcategorias", {erros: erros})
  }
  else{
    // criando uma nova categoria, recebendo os dados do formulario
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }

    // salva a nova categoria
    // As msgs do .flash serão exibidas no partials
    // As variaveis success_msg e error_msg são variaveis globais criadas no app.js
    // *arquivo: _msg.handlebars
    new Categoria(novaCategoria).save().then(() => {
      req.flash("success_msg", "Categoria criada com sucesso!")
      res.redirect("/admin/categorias")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
      res.redirect("/admin")
      // console.log("Erro ao salvar categoria!")
    })
  }
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
  // o body indica que o valor atribuindo ao campo, vai vir de um formulario
  Categoria.remove({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Categoria deletada com sucesso!")
    res.redirect("/admin/categorias")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
    res.redirect("/admin/categorias")
  })
})

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias")
})

router.get("/postagens", eAdmin, (req, res) => {
  //res.render("admin/postagens")
  /*
   populate("categoria") = categoria é o nome do campo na tabela postagens,
   fazendo dessa forma, ele ja busca todos os dados da categoria na outra tabela
   que faz referencia
  */
  Postagem.find().populate("categoria").sort({data:"desc"}).then((postagens) => {
  //Postagem.find().sort({data:'desc'}).then((postagens) => {
    res.render("admin/postagens", {postagens: postagens})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias")
    res.redirect("/admin")
  })

})

router.get("/postagens/add", (req, res) => {
  Categoria.find().then ((categorias) => {
      res.render("admin/addpostagem", {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário")
    res.redirect("/admin")
  })
})

router.post("/postagens/nova", (req, res) => {
  var erros = []

  if(req.body.categoria == "0"){
    erros.push({texto: "Categoria inválida, registre uma categoria"})
  }

  if(erros.length > 0){
    res.render("admin/addpostagem", {erros: erros})
  }else{
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }

    new Postagem(novaPostagem).save().then(() => {
      req.flash("success_msg", "Postagem criada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
      res.redirect("/admin/postagens")
    })
  }
})

// rota de edição de postagens
router.get("/postagens/edit/:id", eAdmin, (req, res) => {

  // vamos fazer duas pesquisas seguidas no mongo
  // vai pegar apenas 1 registro
  Postagem.findOne({_id: req.params.id}).then((postagem) =>{

    // Segunda pesquisa
    Categoria.find().then((categorias) => {
      res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect("/admin/postagens")
    })

  }).catch((err) =>{
    req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
    res.redirect("/admin/postagens")
  })

})

router.post("/postagem/edit", eAdmin, (req, res) => {
  /*
    Procura por uma postagem com o Id igual ao Id informado no formulário
  */
  Postagem.findOne({_id: req.body.id}).then((postagem) => {
    postagem.titulo = req.body.titulo
    postagem.slug = req.body.slug
    postagem.descricao = req.body.descricao
    postagem.conteudo = req.body.conteudo
    postagem.categoria = req.body.categoria

    postagem.save().then(() => {
      req.flash("success_msg", "Postagem editada com sucesso!")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Erro interno")
      res.redirect("/admin/postagens")
    })
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao salvar a edição")
    res.redirect("/admin/postagens")
  })
})

// pratica nao muito recomendada por questões de segurança
router.get("/postagens/deletar/:id", eAdmin, (req, res) =>{
  Postagem.remove({_id: req.params.id}).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso")
    res.redirect("/admin/postagens")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro interno")
    res.redirect("/admin/postagens")
  })
})

// exportando o arquivo

module.exports = router
