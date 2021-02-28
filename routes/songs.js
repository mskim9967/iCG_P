var express = require('express');
var router = express.Router();
var Song = require('../models/Song');

router.get('/', function(req, res, next) {
	Song.find({}, function(err, songs) {
		if(err) return res.json(err);
		res.render('db/index', { songs: songs });
	});
});

router.get('/new', function(req, res){
  res.render('db/new');
});

router.post('/', function(req, res){
  Song.create(req.body, function(err, song){
    if(err) return res.json(err);
    res.redirect('/db');
  });
});

router.get('/:id', function(req, res){
  Song.findOne({_id:req.params.id}, function(err, song){
    if(err) return res.json(err);
    res.render('db/show', { song: song });
  });
});

router.get('/:id/edit', function(req, res){
  Song.findOne({_id:req.params.id}, function(err, song){
    if(err) return res.json(err);
    res.render('db/edit', { song: song });
  });
});

router.put('/:id', function(req, res){
  Song.findOneAndUpdate({_id:req.params.id}, req.body, function(err, song){
    if(err) return res.json(err);
    res.redirect('/db/'+req.params.id);
  });
});

router.delete('/:id', function(req, res){
  Song.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/db');
  });
});

module.exports = router;