사용 언어
Frontend : Pug(Jade), CSS, JavaScript
Backend : Node.js, MongoDB
Result



slide 1

slide 2

slide 3
UI
Slider
swiper 라이브러리 사용
1 슬라이드에 메뉴탭, 2슬라이드에 내용탭, 3슬라이드에 플레이어 탭
1 slide
메뉴 탭, 네비게이션 역할.
메뉴 클릭 시 2 slide로 이동, 2 slide 내용 변경
2 slide
pug의 include로 모든 html 불러온 후, css의 visible 이용하여 내용 변경

.swiper-slide.mid
    include setlist.pug
    include list.pug
3 slide
2 슬라이드에서 곡 선택 시 3 슬라이드로 이동

Logic
DB
MongoDB를 활용하여 json 형식으로 노래 정보를 저장

data form
{
    "_id":{"$oid":"603f707b2d7b650124438963"},
    "title":"태양 키스",
    "singer":"방과 후 클라이맥스 / 모리노 린제 / 소노다 치요코 / 코미야 카호 / 사이죠 쥬리 / 아리스가와 나츠하",
    "CV":"방과 후 클라이맥스 걸즈 / 마루오카 와카나 / 시라이시 하루카 / 코노 히요리 / 나가이 마리코 / 스즈모토 아키호",
    "color":" #ff7700",
    "filename":"Taiyou_Kiss",
    "bpm":{"$numberInt":"177"},
    "level":{"$numberInt":"5"},
    "production":"p283",
    "__v":{"$numberInt":"0"}
}
data binding
// Song.js
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
// index.js
var mongoose = require('mongoose');
var Song = require('../models/Song');

mongoose.connect('mongodb+srv://ms...');
var db = mongoose.connection;
// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

router.get('/', function(req, res, next) {
    Song.find({}, function(err, songs) {
        if(err) return res.json(err);
        res.render('main', { title: 'iCG_P', songs: songs});
    });
});
Player
Load
ajax 통신으로 파일 불러옴

    $(document.body).delegate('.tbl-content tr', 'click', function() {
        $.ajax({
            url: '/api/sendPL',
            dataType: 'json',
            type: 'GET',
            data: {data: $(this).attr('id')},
            success: function(result) {
                if (result) {
                    var song = JSON.parse(result.result);
                    albums = [ song.title ];
                    singer = [ song.singer + ' / CV. ' + song.CV];
                    albumArtworks = [ '/uploads/cover/'+song.filename+'.jpg'];
                    trackUrl = [ '/uploads/mp3/'+song.filename+'.mp3' ];
                    txtLink =  '/uploads/lyric_call/'+song.filename+'.txt';
                    color = song.color;
                    callArr = [];
                    lyricArr = [];
                    txt = [];
                    lidxs = [];
                    cidxs = [];
                    cnt = 0, lidx = 0, cidx = 0, lpassedbeat = 0, cpassedbeat = 0;
                    bpm = 60.0 / parseFloat(song.bpm * 2);
                    initPlayer();
                    $('.textarea').animate({
                        scrollTop: 0
                    }, 300);
                }
            }
        });
        swiper.slideTo(2);
    });

function readTextFile(textFilePath) {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", textFilePath, false);
        rawFile.onreadystatechange = function (){
            if(rawFile.readyState === 4) {
                  if(rawFile.status === 200 || rawFile.status == 0) {
                      var allText = rawFile.responseText;
                      txt = allText.split(/ /); 
                }
            }
        };
        rawFile.send(null);
          ...
Lyric File
곡의 bpm을 계산하여 각 비트에 들어갈 가사를 txt 파일로 저장
(하이픈 하나 당 한 비트를 의미)

우- 랴- 오- 이!$- 우- 랴- 오- 이!$- 
우- 랴- 오- 이!$- 우- 랴- 오- 이!$- 
우- 랴- 오- 이!$- 우- 랴- 오- 이!$- 
우- 랴- 오- 이!$- 우- 랴- 오- 이!$- 
팡$-- 파- 파$- 팡$-- 팡$-- 욧- 샤$- 신- 데레- 라---- 
(짝$-- 짝- 짝$- 짝$-- 짝)$-- 욧- 샤$- 신- 데레- 라---- 
-------------------------------- 
-- 큐- 토$- -- 쿠- 루$- -- 팟- 숑$- -- 핑- 쿠$- -- 브- 루$- -- 오렌- 지$- -- 쟈-- 쟈$---- 
젠-- 료- 쿠$- 단-- 싱$-- 노- 도- 카- 레$- 싱-- 깅-- 
---- 단-- 싱$-- - - - - 싱-- 깅-- 
체- 킷-- 테$- 하- 굿-- 테$- 이- 이- 코$- 이- 이- 코- -- 
-------- 이- 이- 코$- 이- 이- 코- -- 
무- 챠- 부- 리$- 죠- 우- 토- 우$- 츠- 나- 가- 리$- 타- 이- 죠- 우- 
---- 죠- 우- 토- 우$- ---- 타- 이- 죠- 우- 
바- 이- 토$- 바- 이- 토$- 바이- 토$- So!$-- 아이-- 도루!---- 
---------- 아이-- 도루!---- 
---------------- 
-- 뎃- 카이$--- 후츠우-- 타분$-- 후-- 츠우---- 
---------------- 
데- 츠- 부- 츠$--- 데- 츠- 부--- 츠----- 
---------------- 
-- 링- 고$- -- 포- 에무$- -- A-- B---- 
---------------- 
리- 포-- 비$----- 리- 포-- 비----- 
...
Player
각 가사를 각각의 html class로 지정
setInterval를 사용하여 일정 주기마다 현재 mp3 파일의 재생 시간을 확인, 비트가 변경되었다면 해당 가사 class를 active 시켜 css를 변경시킴

function auto_lyric() {
    timerid = setInterval(function(){
            if(cnt > lidxs.length || cnt > cidxs.length)
                clearInterval(timerid);
            var sflag = true;
            if(audio.currentTime >= bpm*cnt) {
                if(cnt == 0 || lidxs[cnt - 1] != lidxs[cnt]) {
                    $('.lyric#l'+lidxs[cnt - 1]).removeClass('active');
                    if($('.lyric#l'+lidxs[cnt]).text() != "\n") {
                        $('.lyric#l'+lidxs[cnt]).addClass('active');    
                    }
                }
                if(cnt == 0 || cidxs[cnt - 1] != cidxs[cnt]) {
                    $('.call#c'+cidxs[cnt - 1]).removeClass('active');
                    if($('.call#c'+cidxs[cnt]).text() != "\n") {
                        $('.call#c'+cidxs[cnt]).addClass('active');
                    }
                }
                cnt++;
            }
              ...
한계점 및 개선안
Web Application
Web Application 구조를 지향하였기에 swiper 라이브러리, setvisible 속성 등을 사용했지만, 여러 파일을 불러올 때의 버벅임과 비효율적인 개발 등 pug의 한계점을 느낌.

React를 활용하면 해결할 수 있을 듯

data form
하나의 곡에 중복된 정보들이 많이 들어간다. 또한 하나의 곡에 하나의 색만 적용 가능, 그마저도 직접 입력해줘야 함.

data 구조를 곡, 아이돌 등으로 나누어 서로 연결시켜주자

UI
구리다. 너무구리다. 디자인 정말 어렵다. CSS파일도 엉망진창이다.

Bootstrap, SASS를 잘 활용해보자

DB-API
API 서버를 따로 제작하여 독립적 개발 지향

Node.js의 vhost를 사용하여 하나의 서버로 여러 어플리케이션 실행 가능 (https://jetalog.net/73)
