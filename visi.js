$(document).ready(function() {
  var canvas, ctx, source, context, analyser, fbc_array, rads,
  	center_x, center_y, radius, radius_old, deltarad, shockwave,
  	bars, bar_x, bar_y, bar_x_term, bar_y_term, bar_width,
  	bar_height, react_x, react_y, intensity, rot, inputURL,
  	JSONPThing, JSONResponse, soundCloudTrackName, audio, pause,
  	artist, title, img_url, isSeeking, initialized, wavesurfer;

  // give vars an initial real value to validate
  bars = 200;
  react_x = 0;
  react_y = 0;
  radius = 0;
  deltarad = 0;
  shockwave = 0;
  rot = 0;
  intensity = 0;
  pause = 1;
  isSeeking = 0;

  wavesurfer = new WaveSurfer.create({
    container: '#waveform',
    waveColor: 'white',
    progressColor: 'red',
    audioRate: 0.75,
  });

  wavesurfer.load($($('audio')[0]).attr('src'));

  wavesurfer.on('ready', function() {
    initPage();
  });

  function initPage() {
  	canvas = document.getElementById("canvas");
  	ctx = canvas.getContext("2d");

  	//resize_canvas();

    $('#canvas').on('click', function() {
      togglepause();
    });

  	// route audio playback
  	fbc_array = new Uint8Array(wavesurfer.backend.analyser.frequencyBinCount);

    wavesurfer.play();
  	frameLooper();
  }

  function resize_canvas() {
  		canvas.width  = $('.trackContainerContainer').width();
  		canvas.height = $('.trackContainerContainer').height();
  }

  // (function() {
  //     var mouseTimer = null, cursorVisible = true;
  //
  //     function disappearCursor() {
  //         mouseTimer = null;
  //         document.body.style.cursor = "none";
  // 		    document.getElementById("hideHead").style.opacity = 0;
  // 		    document.getElementById("hideBody").style.opacity = 0;
  //         cursorVisible = false;
  //     }
  //
  //     document.onmousemove = function() {
  //         if (mouseTimer) {
  //             window.clearTimeout(mouseTimer);
  //         }
  //         if (!cursorVisible) {
  //             document.body.style.cursor = "default";
  // 			document.getElementById("hideHead").style.opacity = 100;
  // 			document.getElementById("hideBody").style.opacity = 100;
  //             cursorVisible = true;
  //         }
  //         mouseTimer = window.setTimeout(disappearCursor, 3000);
  //     };
  // })();

  function togglepause() {
  	if(pause) {
  			pause = 0;
  			wavesurfer.play();
  		} else {
  			pause = 1;
  			wavesurfer.pause();
  		}
  }

  function frameLooper() {
  	resize_canvas(); // for some reason i have to resize the canvas every update or else the framerate decreases over time

    // background gradient
  	var grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  	grd.addColorStop(0, "rgba(0, 0, 0, 1)");
  	grd.addColorStop(1, "rgba(0, 0, 0, 1)");

  	ctx.fillStyle = grd;
  	ctx.fillRect(0, 0, canvas.width, canvas.height);

    // change background with musical intensity
  	ctx.fillStyle = "rgba(255, 255, 255, " + (intensity * 0.0000025 - 0.4) + ")";
  	ctx.fillRect(0, 0, canvas.width, canvas.height);

    // rotation
  	rot = rot + intensity * 0.0000001;

    // center coordinates for visi
  	react_x = 0;
  	react_y = 0;

    // musical intensity representation
  	intensity = 0;

  	wavesurfer.backend.analyser.getByteFrequencyData(fbc_array);

  	for (var i = 0; i < bars; i++) {
  		rads = Math.PI * 2 / bars;
      // rot = 90;
  		bar_x = center_x + Math.cos(rads * i + rot) * (radius + 200);
  		bar_y = center_y + Math.sin(rads * i + rot) * (radius + 200);

  		bar_height = Math.min(99999, Math.max((fbc_array[i] * 2.5 - 200), 0));

  		bar_width = bar_height * 0.02;


  		bar_x_term = center_x + Math.cos(rads * i + rot) * (radius + bar_height);
  		bar_y_term = center_y + Math.sin(rads * i + rot) * (radius + bar_height);

  		ctx.save();

  		var lineColor = "rgb(" + (fbc_array[i]).toString() + ", " + 0 + ", " + 0 + ")";

  		ctx.strokeStyle = lineColor;
  		ctx.lineWidth = bar_width;
  		ctx.beginPath();
  		ctx.moveTo(bar_x, bar_y);
  		ctx.lineTo(bar_x_term, bar_y_term);
  		ctx.stroke();

  		react_x += Math.cos(rads * i + rot) * (radius + bar_height);
  		react_y += Math.sin(rads * i + rot) * (radius + bar_height);

  		intensity += bar_height;
  	}

  	center_x = canvas.width / 2 - (react_x * 0.007);
  	center_y = canvas.height / 2 - (react_y * 0.007);

  	radius_old = radius;
  	radius =  5 + (intensity * 0.002);
  	deltarad = radius - radius_old;

    // draw center circle

  	// ctx.fillStyle = "rgb(" + (fbc_array[i]).toString() + ", " + 0 + ", " + 0 + ")";
  	// ctx.beginPath();
  	// ctx.arc(center_x, center_y, radius + 2, 0, Math.PI * 2, false);
  	// ctx.fill();

  	// shockwave effect
  	shockwave += 60;

  	ctx.lineWidth = 15;
  	ctx.strokeStyle = "rgb(255, 255, 255)";
  	ctx.beginPath();
  	ctx.arc(center_x, center_y, shockwave + radius, 0, Math.PI * 2, false);
  	ctx.stroke();

  	if (deltarad > 15) {
  		shockwave = 0;

  		ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  		ctx.fillRect(0, 0, canvas.width, canvas.height);

  		rot = rot;
  	}

  	if (!isSeeking) {
  		// document.getElementById("audioTime").value = (100 / audio.duration) * audio.currentTime;
  	}
    var canvasArt = document.getElementById('canvas');
    var data = canvasArt.toDataURL();
    var trackContainer = document.getElementsByClassName('trackContainerContainer')[0];
    trackContainer.style.background = 'url('+data+')';;

  	// document.getElementById("time").innerHTML = Math.floor(audio.currentTime / 60) + ":" + (Math.floor(audio.currentTime % 60) < 10 ? "0" : "") + Math.floor(audio.currentTime % 60);
  	(window.requestAnimationFrame || window.webkitRequestAnimation)(frameLooper);
  }

});
