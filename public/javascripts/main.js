var bpm;
var tic = new Audio('../data/tic.mp3');
var cnt = 0;
let callArr = [];
let lyricArr = [];
let txt = [];
let lidxs = [];
let cidxs = [];
var lidx = 0, cidx = 0, lpassedbeat = 0, cpassedbeat = 0;
var scrollflag = true;
var hlflag = false;
var hlflagbefore = false;

$(function()
{
    var playerTrack = $("#player-track"), bgArtwork = $('#bg-artwork'), bgArtworkUrl, albumName = $('#album-name'), trackName = $('#track-name'), albumArt = $('#album-art'), sArea = $('#s-area'), seekBar = $('#seek-bar'), trackTime = $('#track-time'), insTime = $('#ins-time'), sHover = $('#s-hover'), playPauseButton = $("#play-pause-button"),  i = playPauseButton.find('i'), tProgress = $('#current-time'), tTime = $('#track-length'), seekT, seekLoc, seekBarPos, cM, ctMinutes, ctSeconds, curMinutes, curSeconds, durMinutes, durSeconds, playProgress, bTime, nTime = 0, buffInterval = null, tFlag = false, playPreviousTrackButton = $('#play-previous'), playNextTrackButton = $('#play-next'), currIndex = 0;
	
	var albums = ["temp"], singer = ["temp"], albumArtworks = ["temp"], trackUrl = ["temp"], txtLink;
	var audio = new Audio();
	var timerid, color;
	///////////////////////////
	
	
	var swiper = new Swiper('.swiper-container', {
		shortswipes: false,
		threshold: 25,
	});
	
	swiper.on('touchMove', function() {
		if(swiper.realIndex == 0) {
		
		}
		else {
		
		}
		
	});
	
	$('.mid .setlist').hide();
	$('#music').click(function(){
		$('.mid .setlist').hide();
		$('.mid .musiclist').show();
		swiper.slideTo(1);
	});
	
	$('#setlist').click(function(){
		$('.mid .musiclist').hide();
		$('.mid .setlist').show();
		swiper.slideTo(1);
	});
	
	$('#community').click(function(){
		alert('준비중입니다!');
	});
	$('#login').click(function(){
		alert('준비중입니다!');
	});
	
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
					cnt = 0;
					callArr = [];
					lyricArr = [];
					txt = [];
					lidxs = [];
					cidxs = [];
					lidx = 0, cidx = 0, lpassedbeat = 0, cpassedbeat = 0;
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
	
	$('.textarea').bind("touchmove", function(e){
			scrollflag = false;		
	});
	$('.textarea').on('wheel',function(){
			scrollflag = false;		
	});
	
	$('.textarea').click(function(e){
		scrollflag = true;
		if (e.target === this)
			scrollToNow();
	});
		
	$(document.body).delegate('.lyric, .call','click',function() {
		if($(this).attr("id").substr(0,1) == 'l')
			cnt = lidxs.indexOf(parseInt($(this).attr("id").substr(1)));
		else if($(this).attr("id").substr(0,1) == 'c')
			cnt = cidxs.indexOf(parseInt($(this).attr("id").substr(1)));

		audio.currentTime = cnt * bpm;
		$('.lyric').removeClass('active');
		$('.call').removeClass('active');
		$('.lyric#l'+lidxs[cnt]).addClass('active');
		$('.call#c'+cidxs[cnt]).addClass('active');
		hlflag = false;
		scrollToNow();
	});


	///////////////////sort
	var thIndex = 0, curThIndex = null, ascflag = false;
	$('.tbl-header th').click(function() {
		ascflag = !ascflag;
		thIndex = $(this).index();
		sorting = [];
		tbodyHtml = null;
		$('.tbl-content tr').each(function(){
			sorting.push($(this).children('td').eq(thIndex).html() + ', ' + $(this).index());
		});
		sorting = sorting.sort(function(a, b) {
			const upperCaseA = a.toUpperCase();
			const upperCaseB = b.toUpperCase();
			var ret;
			if(upperCaseA < upperCaseB) ret = 1;
			if(upperCaseA > upperCaseB) ret = -1;
			if(upperCaseA === upperCaseB) ret = 0;
			return ascflag ? ret : -1 * ret;
		});
		for(var sortingIndex = 0; sortingIndex < sorting.length; sortingIndex++){
			rowId = parseInt(sorting[sortingIndex].split(', ')[1]);
			tbodyHtml = tbodyHtml + $('.tbl-content tr').eq(rowId)[0].outerHTML;
		}
		$('.tbl-content tbody').html(tbodyHtml);
	});
	
	$("#search").on("keyup", function(){
		updateMusicList();
	});
	
	$("select#production, select#level").change(function() {
		updateMusicList();
	});
		
	//////////////////
	playPauseButton.on('click',playPause);
	sArea.mousemove(function(event){ showHover(event); });
	sArea.mouseout(hideHover);
	sArea.on('click',playFromClickedPos);
	$(audio).on('timeupdate',updateCurrTime);

	$('td.production').each(function(index, item) {
		$(item).css({
			'background-image':'url("images/'+$(item).attr('id')+'.png")',
			'background-position': 'center',
			'background-repeat':'no-repeat',
			'background-size':'auto 50%',

		});
	});
	slideForever();
	
	function slideForever() {
		$('.slideArea').each(function(index, object) {
			if($(object)[0].scrollWidth > $(object).innerWidth())
				$(object).marquee({
					behavior:"scroll",
					direction:"left",
					duration: 3500
				})
		});
	}


	
	////////////////////////////////////
	function updateMusicList() {
		var inputvalue = $(".search input#search").val().toLowerCase();
		var productionval = $(".search select#production").val();
		var levelval = $(".search select#level").val();
		$('.tbl-content tr').hide();
		$(".tbl-content tr").each(function(index, object) {
			if($(object).text().toLowerCase().indexOf(inputvalue) > -1
				&& ($(object).children('.production').attr('id') === productionval || productionval == '')
				&& ($(object).children('.level').text() === levelval || levelval == ''))
				$(object).show();
		});
	}

	function auto_lyric() {
		timerid = setInterval(function(){
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
				if(callArr[cidxs[cnt]].includes('['))
					hlflag = true;
				else if(callArr[cidxs[cnt]].includes(']'))
					hlflag = false;
				if( scrollflag && !$('.textarea').is(':animated'))
					if($('.lyric.active')[0] && $('.lyric#l'+lidxs[cnt]).text().includes("\n")) 
						$('.textarea').animate({
							scrollTop: ($('.lyric#l'+lidxs[cnt])[0].offsetTop - $('.textarea')[0]['clientHeight'] * 0.35)
						}, 400);
					else if(!$('.lyric.active')[0] && $('.call.active')[0] && $('.call#c'+cidxs[cnt]).text().includes("\n")) 
						$('.textarea').animate({
							scrollTop: ($('.call#c'+cidxs[cnt])[0].offsetTop - $('.textarea')[0]['clientHeight'] * 0.35)
						}, 400);
			
				if( hlflag != hlflagbefore) {
					if(hlflag) {
						$('.textarea').css({
							'box-shadow': '0px 0px 4vh rgba(255, 106, 0)',
								'transition': 'box-shadow 1s ease'
						});
						document.documentElement.style.setProperty("--color", 'orange');
					}
					else {
						$('.textarea').css({
								'box-shadow':'unset',
								'transition': 'box-shadow 1s ease'
						});
						document.documentElement.style.setProperty("--color", color);
					}
					hlflagbefore = hlflag;
				}
		}, 70);
	}

	
	function scrollToNow() {
		if($('.lyric.active')[0]) 
			$('.textarea').animate({
				scrollTop: ($('.lyric#l'+lidxs[cnt])[0].offsetTop - $('.textarea')[0]['clientHeight'] * 0.35)
			}, 300);
		else 
			$('.textarea').animate({
				scrollTop: ($('.call#c'+cidxs[cnt])[0].offsetTop - $('.textarea')[0]['clientHeight'] * 0.35)
			}, 300);
	}


	function playPause()
	{
		setTimeout(function()
		{
			if(audio.paused)
			{
				playerTrack.addClass('active');
				albumArt.addClass('active');
				checkBuffering();
				i.attr('class','fas fa-pause fa');
				audio.play();
				auto_lyric();
			}
			else
			{
				clearInterval(timerid);
				playerTrack.removeClass('active');
				albumArt.removeClass('active');
				clearInterval(buffInterval);
				albumArt.removeClass('buffering');
				i.attr('class','fas fa-play fa');
				audio.pause();
			}
		},300);
	}


	function showHover(event)
	{
		seekBarPos = sArea.offset(); 
		seekT = event.clientX - seekBarPos.left;
		seekLoc = audio.duration * (seekT / sArea.outerWidth());

		sHover.width(seekT);

		cM = seekLoc / 60;

		ctMinutes = Math.floor(cM);
		ctSeconds = Math.floor(seekLoc - ctMinutes * 60);

		if( (ctMinutes < 0) || (ctSeconds < 0) )
			return;

		if( (ctMinutes < 0) || (ctSeconds < 0) )
			return;

		if(ctMinutes < 10)
			ctMinutes = '0'+ctMinutes;
		if(ctSeconds < 10)
			ctSeconds = '0'+ctSeconds;

		if( isNaN(ctMinutes) || isNaN(ctSeconds) )
			insTime.text('--:--');
		else
			insTime.text(ctMinutes+':'+ctSeconds);

		insTime.css({'left':seekT,'margin-left':'-21px'}).fadeIn(0);

	}

	function hideHover()
	{
		sHover.width(0);
		insTime.text('00:00').css({'left':'0px','margin-left':'0px'}).fadeOut(0);		
	}

	function playFromClickedPos()
	{
		hlflag = false;
		$('.lyric').removeClass('active');
		$('.call').removeClass('active');
		audio.currentTime = seekLoc;
		cnt = lpassedbeat = cpassedbeat = parseInt(audio.currentTime / bpm);
		scrollflag = true;
		if($('.lyric.active')[0]) 
			$('.textarea').animate({
				scrollTop: ($('.lyric#l'+lidxs[cnt])[0].offsetTop - $('.textarea')[0]['clientWidth'] / 2)
			}, 300);
		else 
			$('.textarea').animate({
				scrollTop: ($('.call#c'+cidxs[cnt])[0].offsetTop - $('.textarea')[0]['clientWidth'] / 2)
			}, 300);
		seekBar.width(seekT);
		hideHover();
	}

	function updateCurrTime()
	{
		nTime = new Date();
		nTime = nTime.getTime();

		if( !tFlag )
		{
			tFlag = true;
			trackTime.addClass('active');
		}

		curMinutes = Math.floor(audio.currentTime / 60);
		curSeconds = Math.floor(audio.currentTime - curMinutes * 60);

		durMinutes = Math.floor(audio.duration / 60);
		durSeconds = Math.floor(audio.duration - durMinutes * 60);

		playProgress = (audio.currentTime / audio.duration) * 100;

		if(curMinutes < 10)
			curMinutes = '0'+curMinutes;
		if(curSeconds < 10)
			curSeconds = '0'+curSeconds;

		if(durMinutes < 10)
			durMinutes = '0'+durMinutes;
		if(durSeconds < 10)
			durSeconds = '0'+durSeconds;

		if( isNaN(curMinutes) || isNaN(curSeconds) )
			tProgress.text('00:00');
		else
			tProgress.text(curMinutes+':'+curSeconds);

		if( isNaN(durMinutes) || isNaN(durSeconds) )
			tTime.text('00:00');
		else
			tTime.text(durMinutes+':'+durSeconds);

		if( isNaN(curMinutes) || isNaN(curSeconds) || isNaN(durMinutes) || isNaN(durSeconds) )
			trackTime.removeClass('active');
		else
			trackTime.addClass('active');


		seekBar.width(playProgress+'%');

		if( playProgress == 100 )
		{
			i.attr('class','fa fa-play');
			seekBar.width(0);
			tProgress.text('00:00');
			albumArt.removeClass('buffering').removeClass('active');
			clearInterval(buffInterval);
		}
	}

	function checkBuffering()
	{
		clearInterval(buffInterval);
		buffInterval = setInterval(function()
		{ 
			if( (nTime == 0) || (bTime - nTime) > 1000  )
				albumArt.addClass('buffering');
			else
				albumArt.removeClass('buffering');

			bTime = new Date();
			bTime = bTime.getTime();

		},100);
	}

	
	function playOneTrack(flag)
	{
		{
			if( flag == 0 )
				i.attr('class','fa fa-play');
			else
			{
				albumArt.removeClass('buffering');
				i.attr('class','fa fa-pause');
			}

			seekBar.width(0);
			trackTime.removeClass('active');
			tProgress.text('00:00');
			tTime.text('00:00');

			currAlbum = albums[0];
			currTrackName = singer[0];
			currArtwork = albumArtworks[0];

			audio.src = trackUrl[0];

			nTime = 0;
			bTime = new Date();
			bTime = bTime.getTime();

			if(flag != 0)
			{
				audio.play();
				playerTrack.addClass('active');
				albumArt.addClass('active');

				clearInterval(buffInterval);
				checkBuffering();
			}

			albumName.text(currAlbum);
			trackName.text(currTrackName);
			albumArt.find('img.active').removeClass('active');

			bgArtworkUrl = currArtwork;

			albumArt.css({
				'content':'url('+bgArtworkUrl.substring(1)+')'
			});
		}
	}
	function initPlayer()
	{	
		readTextFile(txtLink);
		document.documentElement.style.setProperty("--color", color);
		audio.pause();
		playOneTrack(1);
		auto_lyric();
		audio.loop = false;
		if($('.slideArea#track-name')[0].scrollWidth > $('.slideArea#track-name').innerWidth())
				$('.slideArea#track-name').marquee({
					behavior:"scroll",
					direction:"left",
					duration: 5000
				})
	}


	function readTextFile(textFilePath) { //set a variable
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", textFilePath, false); //user variable here
		rawFile.onreadystatechange = function (){
			if(rawFile.readyState === 4) {
				  if(rawFile.status === 200 || rawFile.status == 0) {
					  var allText = rawFile.responseText;
					  txt = allText.split(/ /); //split by line break and add to array
				}
			}
		};
		rawFile.send(null);
		$('.textarea').text("");

		var f = true;
		var li = 0, ci = 0;
		var isLineEmpty = true, isLineEmptyBefore = true;
		for(var ii=0; ii<txt.length; ii++){
			if(txt[ii].includes("\n")) {
				f = !f;
				if(!isLineEmpty) $('.textarea').append('<br>');
				if(f && !isLineEmpty)$('.textarea').append('<br>');

				isLineEmptyBefore = isLineEmpty;
				isLineEmpty = true;
			}
			else if(isLineEmpty) {
				if(txt[ii].replace(/\n| |-|\[|\]/g,"").length != 0) isLineEmpty = false;
			}
			if(f) {
				for(let i = 0; i < txt[ii].length; i++)
					if(txt[ii][i] == '-') lidxs.push(lyricArr.length);

				$('.textarea').append('<span class="lyric" id="l'+li+'"></span>');
				$('.lyric#l'+li).text(txt[ii].replace(/-|\[|\]/g, "").replace(/[$]/g," "));
				lyricArr.push(txt[ii]);
				li++;
			}
			else {
				for(let i = 0; i < txt[ii].length; i++)
					if(txt[ii][i] == '-') cidxs.push(callArr.length);

				$('.textarea').append('<span class="call" id="c'+ci+'"></span>');
				$('.call#c'+ci).text(txt[ii].replace(/-|\[|\]/g, "").replace(/[$]/g," "));
				callArr.push(txt[ii]); 
				ci++;
			}
		}
	};
});



