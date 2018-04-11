//Create a blank canvas on page load.
window.onload=function(){
	// CanvasColor();
};


//TODO FISHNET absolute links need looking into, moving to another Rosehill domain would still use the rosehilltpv.com assets currently.


useParts=0; //If true it will use parts 0/20 parts, otherwise it will use percent, 0% / 10%

//This will be updated with the  selected colours
var NewColors = [];

CanvasCall = "";

$(function() {

	if(useParts){
		$('.use-parts').show();
	}else{
		$('.use-perc').show();
	}

	$( ".download_area_outer" ).dialog({
      autoOpen: false,
      resizable: false,
      draggable: false,
      modal: false,
    });

	//Switch the image from InPlay/InSport
	$(".tab").live("click", function(e) {
		$('.tab').removeClass('selected');
		$(this).addClass('selected');

		//Reload the canvas with the correct mixer variation.
		CanvasColor();
	});

	//Runs the PDF processing so that it can be downloaded.
	$(".downloadPDF").live("click", function(e) {

		//Check if the loading block is shown, run function if it's not
		// - Otherwise run this function every second until it's complete.
		if(!$('.loading-block').is(':visible')){
			console.log('Nothing processing, can load PDF');
			$('.loading-block').show();

			//Generate the image and put onto server.
			/*var options = {
			"url": "/blocks/color_mixer/saveImageToServer.php?time="+new Date().getTime(),
			"data": "data=" + $('.colour_mixer-outer #image1').attr('src'),
			"type": "post",
			success:function(result){
				$(".colour_mixer-outer #image1").attr('src', result);//Replace the base64 image with the resulting image URL, passed as 'result' variable
				ProcessPDF();
			}
			};
			$.ajax(
				options
			);*/
			var doc = new jsPDF('p', 'mm', [500, 1000]);
      var src = $('.colour_mixer-outer #image1').attr('src');
			console.log(src);
			//doc.fromHTML( $('.colour_mixer-outer #image1').clone(), 1280, 1280);
			doc.addImage(src,0,0,200,100);
			var b = $('.mixer-colour-outer');
			var x = 0;
			var y = 100;	
			b.each(function(i, c) {
				y += 10;
				doc.text(x, y, c.innerText.replace(/\n/g,''));
			});
			doc.save('color-mix.pdf');
		}else{
			console.log('Wait for Completion');
			function WaitForCompletion(){
				$(".downloadPDF").click();
			}
			setTimeout(WaitForCompletion, 1000);
		}
	});


	//Called once the Image has been saved to the server, generates a PDF and shows a Modal Dialog which allows the user to download it.
	function ProcessPDF(){
		//Grab a copy of the original html, we reload this back once the PDF has been generated.
		Orig_html = $('.colour_mixer-outer .colour_mixer').clone();

		//Remove things not needed for the PDF download.
		$('#play_mixer, #sport_mixer, .loading-block, .instructions, .mixer-options, .not-PDF').remove();

		var tableCols = [];


		//Remove unused colours. Any colours used are restyled to remove +/-.
		$('.mixer-colour-outer').each(function(){
			val = $(this).find('.percent').text();

			val = parseFloat(val);
			if(!val){
				$(this).parent().remove();//Remove the unused colors
			}else{
				$(this).find('.mixer-color-inner').html($(this).find('.percent').html());// Remove the +/- controls - by getting just the percent div html and overwriting the inner element.
				$(this).find('.mixer-color-inner').css('font-size', '22px'); //Resize the text to fit
				tableCols.push($(this).parent().html());
			}
		});


		//Clear the table and re-sort the table cells into rows of 7 colours.
		$('.mixer-controls table').empty();
		html = '<tr>';
		for (var i = 0; i < tableCols.length; i += 1) {
			if(i % 7 == 0){ html += '</tr><tr>'; } //If maximum number on this row (multiple of 5), create a new row.
			html += '<td>'+tableCols[i]+'</td>';
		}
		html += '</tr>';
		$('.mixer-controls table').html(html);

		var tableCols = [];//Clear array, quite a large block of data to store and never used from here.

		//Put the html content into .saveAsPDF_progress, this will be used for the PDF download later.
		//Then put the original html content back into the mixer.
		$('.reference').append($('.testimg').attr('src'));

		html = $('.colour_mixer-outer .colour_mixer').clone();
		$('.colour_mixer-outer').empty();
		$('.colour_mixer-outer').html(Orig_html);


		$('.saveAsPDF_progress').empty();
		$('.saveAsPDF_progress').html(html);

		//var doc = new jsPDF()

		//doc.fromHTML(html, 1280, 1280)
		//doc.save('a4.pdf');
	
	}

	//Reset all the chosen colors back to zero.
	$(".ResetColorMixer").live("click", function(e) {
		$('.percent').each(function(){
			$(this).text('0');
		});

		$(".parts-progress").find("div.active").removeClass('active');
		$('.parts-amount span.amnt').text(0);

		NewColors = [];
		CanvasColor();
	});

	//When a 'percent' (actually now parts) change is detected it changes the percentage in the button, then after a brief delay will process the mixer with the new color
	// - the delay resets each time a button is clicked, therefore the canvas only needs to update once for a 'batch' of new colors.
	$(".ChangePercentageUp, .ChangePercentageDown").live("click", function(e) {
		e.preventDefault;

		//Get the rgb reprsentation of the color.
		color = $(this).attr('color');
		rgb = hex2rgb(color);

		//Get the current value of THIS button.
		CurrentValue = $(this).siblings('.percent').text();
		CurrentValue = parseFloat(CurrentValue);

		//Check all .percents for total %
		TotalValue = 0;
		$('.percent').each(function(){
			value = $(this).text();
			TotalValue += parseFloat(value);
		});
		// console.log('Current Total Value: '+TotalValue);

		//The Total Value wont pass this, not can it go below zero.
		MaximumValue=20;//Number of colors
		if(!useParts)MaximumValue=MaximumValue*5;//As percentage

		className = $(this).attr('class');
		if(className=='ChangePercentageUp' && TotalValue<MaximumValue){
			//If percentage up
			//Add this to its value, if not at the maximum.

			if(useParts){
				addValue=1;
			}else{
				addValue=5;
			}
			CurrentValue = CurrentValue+addValue;

			//Update the progress bar
			$('.parts-amount span.amnt').text(TotalValue+addValue);
			$(".parts-progress").find("div").not(".active").first().addClass('active');

			//Add to colors array
			NewColors = $.merge(NewColors, rgb);

		}else if(className=='ChangePercentageDown' && CurrentValue>0){
			//Subtract d 5% to its value, if not zero.

			if(useParts){
				addValue=1;
			}else{
				addValue=5;
			}
			CurrentValue = CurrentValue-addValue;

			//Update the progress bar
			$('.parts-amount span.amnt').text(TotalValue-addValue);
			$(".parts-progress").find("div.active").last().removeClass('active');

			//Remove from colors array
			jQuery.each(NewColors, function(i, val) {
				if(val.Red == rgb[0].Red && val.Green == rgb[0].Green && val.Blue == rgb[0].Blue){
					delete NewColors[i];
					return false;
				}
			});
		}else{
			return false;
		}

		//Update this value with the new value.
		$(this).siblings('.percent').text(CurrentValue);
		if(!useParts){ $(this).siblings('.percent').append('%'); }

		NewColors = $.unique(NewColors);//Reset the keys to zero indexed (otherwise each wont work!)

		clearTimeout(CanvasCall); //Reset the below timeout
		CanvasCall = setTimeout(function() { CanvasColor();	}, 2000);//Run in 1 second, and reset each time a value is changed.
	});
});

//Converts a hex color to rgb array
function hex2rgb(hexStr){
	 var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr);
	return result ? [{
		"Red": parseInt(result[1], 16),
		"Green": parseInt(result[2], 16),
		"Blue": parseInt(result[3], 16)
	}]: null;
}


//This is the main function for coloring the Canvas, it uses a web worker, where supported IE10> (located in a js file 'js/recolorImage.js') to process the coloring in the background.
function CanvasColor(){
	var start = new Date();
	$('.loading-block').show();

	console.log('Running Canvas');

	id = $('.tab.selected').attr('id');
	console.log(id);
	if(id=="Play"){
		var image0 = document.getElementById("play_mixer");
		$('.grid').attr('src','../img/colour_mixer-inPlay-grid.png');
	}else{
		var image0 = document.getElementById("sport_mixer");
		$('.grid').attr('src','../img/colour_mixer-v4-grid.png');
	}

	var image = new Image();
	image.onload = function () {

		var c = document.createElement('canvas');
		var ctx = c.getContext("2d");
		var w = image.width;
		var h = image.height;

		c.width = w;
		c.height = h;

		 // draw the image on the temporary canvas
		ctx.drawImage(image, 0, 0, w, h);

		if (!window.Worker) {
			//Web Workers not supported, must be processed in this thread, the whole webpages generally freeze.
			// console.log('Workers not supported');

			var imageData = ctx.getImageData(0, 0, w, h);
			imageDataArray = imageData.data;
			imageDataArray = recolorImage(imageDataArray, NewColors);
			imageData.data = imageDataArray;
			ctx.putImageData(imageData, 0, 0);

			var dataURL = c.toDataURL('image/png');
			$('.colour_mixer-outer #image1').attr('src', dataURL);

			$('.loading-block').hide();

			var diff = new Date() - start;
			console.log('Process done in ' + diff + ' ms (no web workers)');
		}else{
			//Workers are supported, pass the canvas processing to a new thread to do the work in the background (to prevent browser lockup)
			// console.log('Workers supported');

			var workersCount = 1;
			var finished = 0;

			var onWorkEnded = function (e) {
				var imageData = e.data.result;
				var index = e.data.index;

				finished++;

				// put the altered data back on the canvas
				ctx.putImageData(imageData, 0, 0);

				var dataURL = c.toDataURL('image/png');
				$('.colour_mixer-outer #image1').attr('src', dataURL);

				$('.loading-block').hide();

				if (finished == workersCount) {
					var diff = new Date() - start;
					console.log("Process done in " + diff + " ms");
				}
			};

			for (var index = 0; index < workersCount; index++) {
				var worker = new Worker("http://localhost:8000/js/recolorImage.js?time="+new Date().getTime());
				worker.onmessage = onWorkEnded;

				var imageData = ctx.getImageData(0, 0, w, h);
				worker.postMessage({ imageData: imageData, colors: NewColors, index: index} );
			}

		}


	};
	if(image0){
		image.src = image0.src;
	}

}
