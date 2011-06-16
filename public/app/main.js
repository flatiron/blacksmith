var app = module.parent.exports,
    db = app.db;

// Routes
app.get('/', function(req, res){
  res.render('layout', {});
});