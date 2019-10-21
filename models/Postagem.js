const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Postagem = new Schema({
  titulo: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  conteudo: {
    type: String,
    required: true
  },
  categoria:{
    //quando faço este tipo de tratamento usando o mongoose, ele ja traz todos os dados de referencia do objetivo 
    type: Schema.Types.ObjectId, // significa que o campo vai armazenar o id de algum objeto,
    ref: "categorias", // nome do modulo que faz referencia
    required: true
  },
  data:{
    type: Date,
    default: Date.now()
  }
})

mongoose.model("postagens", Postagem)
