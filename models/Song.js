var mongoose = require('mongoose');

var songSchema = new mongoose.Schema({ 
	title: String,
	filename: String,
	singer: String,
	CV: String,
	color: String,
	bpm: Number,
	level: Number,
	production: String
});

var Song = mongoose.model('song', songSchema);

module.exports = Song;