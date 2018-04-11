self.onmessage = function (e) {
	try {
		var imageData = e.data.imageData;
	
			var binaryData = [];
		if(imageData.data){
				var binaryData = imageData.data;
		}
	
			var colors =  e.data.colors;
			var index =  e.data.index;
	
		try{
			binaryData = recolorImage(binaryData, colors);
			imageData.data = binaryData;
		}catch(e){
			//alert('Error:'+e);
		}
		self.postMessage({ result: imageData, index: index });
	} catch(e) {
	//	console.log(e);
	}


};

function recolorImage(imageDataArray, NewColors) {
    var oldColor = [
    	"AE6D3F",
    	"C8C6C7",
    	"CE2921",
    	"D0A125",
    	"D75616",
    	"DF4B87",
    	"E6DDC6",
    	"E7D25B",
    	"E8C698",
    	"3869AC", //10
    	"3396C3",
    	"479F86",
    	"4B438D",
    	"57B9C2",
    	"5FB246",
    	"609FD6",
    	"77736F",
    	"76975C",
    	"9A998F",
    	"9875AC", //20

    	//The below colors are what the Android version of firefox thinks the image has!
    	"639ed6",
    	"ce2821",
    	"9c9a8c",
    	"e7dfc6",
    	"52bac6",
    	"73965a",
    	"e7d35a",
    	"efc79c",
    	"429e84",
    	"de4984", //10
    	"ad6d39",
    	"d65510",
    	"4a418c",
    	"9c75ad",
    	"73716b",
    	"d6a221",
    	"cec7c6",
    	"3196c6",
    	"5ab242",
    	"3969ad", //20
    ];

    // examine every pixel,
    // change any old rgb to the new-rgb
    doonce=true;
    for (var i = 0; i < imageDataArray.length; i += 4) {
    	match=false;
    	for (var x = 0; x < oldColor.length; x += 1) {

			color = oldColor[x];
			rgb = hex2rgb(color);

	        // is this pixel the old rgb?
	        if (imageDataArray[i] == rgb[0].Red && imageDataArray[i + 1] == rgb[0].Green && imageDataArray[i + 2] == rgb[0].Blue) {
				// change to new rgb
				match=true;

				//Fix for Firefox (Android Version) didnt detect array existed using NewColors[0]
				y=x;
				if(x>19)y=x-20;
				InArray = y in NewColors;

				// if(doonce){ $('.instructions').html('Y='+y+" x="+x); doonce=false; }

				if(NewColors[y]){
					//Get the next 'NewColor' and change the pixel color
					imageDataArray[i] = NewColors[y].Red;
					imageDataArray[i + 1] = NewColors[y].Green;
					imageDataArray[i + 2] = NewColors[y].Blue;
					break;
				}else{
		        	//If no NewColor in this array (i.e. this 5% not yet set) just set to white.
					imageDataArray[i] = 255;
					imageDataArray[i + 1] = 255;
					imageDataArray[i + 2] = 255;
					imageDataArray[i + 3] = 0;
				}
	        }else{
	        	//If no match, ignore this color
			}
		}
   		if(!match && (imageDataArray[i]!=255 && imageDataArray[i+1]!=255 && imageDataArray[i+2]!=255)){
			imageDataArray[i] = 255;
			imageDataArray[i + 1] = 255;
			imageDataArray[i + 2] = 255;
			imageDataArray[i + 3] = 0;
   		}
	}

    return imageDataArray;
}

function hex2rgb(hexStr){
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexStr);
    return result ? [{
       	"Red": parseInt(result[1], 16),
        "Green": parseInt(result[2], 16),
        "Blue": parseInt(result[3], 16)
    }]: null;
}