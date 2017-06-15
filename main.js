

/* Enumerations */
var CASTING = Object.freeze({"DIAGONAL":1, "PARALAL":2, "PERSPECTIVE":3});
var ROTATE = Object.freeze({"X":1, "Y":2, "Z":3});

/* Global File Management Parameters */
var f_fileLoaded = false;
var g_file;

/* Global Graphic Objects */
var g_vertices = new Array();
var g_polygons = new Array();
var g_casting;

function reset(reloadFile)
{
	document.getElementById('castPara').checked="yes";	
	document.getElementById('xAngle').value="0";
	document.getElementById('yAngle').value="0";
	document.getElementById('zAngle').value="0";
	document.getElementById('zoom').value="100";
	g_casting = CASTING.PARALAL;
	
	graphicUtils_clear();
	
	if(reloadFile == true)
	{
		if(f_fileLoaded == true)
		{
			processFile();		
			refresh();
		}
		else
		{
			document.getElementById('fileInput').value = null; //clear file field for same file reload
		}
	}
	else if(reloadFile == false)
	{
		f_fileLoaded = false;
	}
}

function load(fileObject)
{
	if(fileObject.files && fileObject.files[0])
	{
		var reader = new FileReader();
		
		reset(false);
		
		reader.onload = function (e)
		{  
			//g_file = e.target.result;
				
			processFile(e.target.result);
			refresh();
		};
		
		reader.readAsText(fileObject.files[0]); //Read all text in file into global variable
	}				
}

function processFile(file)
{
	var data = JSON.parse(file);
	g_vertices = data.Vertices.Cube.concat(data.Vertices.Pyramid);
        g_polygons = data.Polygons.Cube.concat(data.Polygons.Pyramid);
	//var data = file.split('\n'),
    //
	// var vertexNum = 0,
	//  polygonNum = 0;
	//
	// /* Parsing - expecting 12 vertices & 10 polygons */
	// for(line in lines)
	// {
	// 	if((lines[line].length > 5) && (lines[line][0] != '#'))
	// 	{
	// 		if(vertexNum < 12)
	// 		{
	// 			g_vertices[vertexNum] = lines[line].split(',');
	// 			vertexNum++;
	// 		}
	// 		else if(polygonNum < 10)
	// 		{
	// 			g_polygons[polygonNum] = lines[line].split(',');
	// 			polygonNum++;
	// 		}
	// 	}
	// }

	if(g_vertices.length==12 && g_polygons.length==10){
        graphicUtils_normalize();
        f_fileLoaded = true;
    }
	// if(vertexNum == 12 && polygonNum == 10)
	// {
	// 	graphicUtils_normalize();
	// 	f_fileLoaded = true;
	// }
	else
	{
		f_fileLoaded = false;
	}
}
		
function refresh()
{
	if(f_fileLoaded == true)
	{
		graphicUtils_clear();		
		graphicUtils_drawPolygons();
	}
}

function setCasting(cast)
{
	if(f_fileLoaded == true)
	{
		g_casting = cast;
		refresh();
	}
}

function setAngleValue(input, axis)
{
	if(f_fileLoaded == true)
	{
		graphicUtils_applyAngle(input.value, axis);
		refresh();
	}
}

function setZoomValue(input)
{
	if(f_fileLoaded == true)
	{
		graphicUtils_applyZoom(input.value);
		refresh();
	}
}
