// variavel de ambiente que verifica se a aplicação esta rodando em produção
if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://rodrigonunes:marialucia@bloqapp-prod-rgdqq.mongodb.net/test?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/bloqapp"}
}
