var express = require('express');
var router = express.Router();
const app = express();
var mongoose = require('mongoose');
var Song = require('../models/Song');

mongoose.connect('mongodb+srv://ms:ms@cluster.nr61f.mongodb.net/icgp?retryWrites=true&w=majority');
var db = mongoose.connection;
// DB setting
mongoose.set('useNewUrlParser', true);    // 1
mongoose.set('useFindAndModify', false);  // 1
mongoose.set('useCreateIndex', true);     // 1
mongoose.set('useUnifiedTopology', true); // 1
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});

////////////////////////////////////////


////////////////////////////////////////
router.get('/', function(req, res, next) {
	Song.find({}, function(err, songs) {
		if(err) return res.json(err);
		res.render('main', { title: 'iCG_P', songs: songs});
	});
});

router.get('/views/list', function(req, res, next) {
	res.render('list', { });
});

router.get('/views/setlist', function(req, res, next) {
  res.render('setlist', { });
});

router.get('/api/sendPL', function(req,res) {
      var data = req.query.data;
      var result = data;
      console.log(result);
      res.send({result:result});
});	


module.exports = router;

