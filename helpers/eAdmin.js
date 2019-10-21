module.exports = {
  eAdmin: function(req, res, next){
    /*
      isAuthenticated => função gerada pelo passport, que verifica se
      o usuario esta autenticado
    */
    if(req.isAuthenticated() && req.user.eAdmin == 1){
      return next();
    }

    req.flash("error_msg", "Você precisa ser um Admin!")
    res.redirect("/")
  }
}
