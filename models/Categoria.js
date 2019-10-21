// é uma boa pratica criar o modulo no singular e com a primeira letra em maiusculo
const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const Categoria = new Schema({
  nome:{
    type: String,
    require: true
  },
  slug:{
    type: String,
    require: true
  },
  date:{
    type:Date,
    default: Date.now()
  }
})

mongoose.model("categorias", Categoria)
