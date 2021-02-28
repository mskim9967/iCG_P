var mongoose = require('mongoose');

var songSchema = new mongoose.Schema({ 
	title: String,
	singer: String,
	CV: String,
	cover: String,
	mp3: String,
	lyric_call: String,
	bpm: Number,
	level: Number,
	production: String
});

var Song = mongoose.model('song', songSchema);

module.exports = Song;