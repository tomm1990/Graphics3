
/* Global Graphic Objects */
var canvas, context;
var dDepth = 10000;
var visiblePolygons = new Array();
var CAVALIER = -45 * (Math.PI / 180);
window.onload = function(){ //verify canvs is loaded
		canvas = document.getElementById('workspace');
		context = canvas.getContext('2d');
	};


function graphicUtils_clear()
{
	context.clearRect(0, 0, canvas.width, canvas.height);
}

//make sure shapes values fit in the screen and positioned well
function graphicUtils_normalize()
{
	var i, maxX = 0, maxY = 0, minX = 0, minY = 0, rangeX, rangeY, diff;

    g_vertices.forEach(function(elemnt){
        if(elemnt[0] > maxX)
        {
            maxX = elemnt[0];
        }

        if(elemnt[0] < minX)
        {
            minX = elemnt[0];
        }

        if(elemnt[1] > maxY)
        {
            maxY = elemnt[1];
        }

        if(elemnt[1] < minY)
        {
            minY = elemnt[1];
        }

	});


	// for(i = 0; i < g_vertices.length; i++)
	// {
	// 	if(g_vertices[i][0] > maxX)
	// 	{
	// 		maxX = g_vertices[i][0];
	// 	}
	//
	// 	if(g_vertices[i][0] < minX)
	// 	{
	// 		minX = g_vertices[i][0];
	// 	}
	//
	// 	if(g_vertices[i][1] > maxY)
	// 	{
	// 		maxY = g_vertices[i][1];
	// 	}
	//
	// 	if(g_vertices[i][1] < minY)
	// 	{
	// 		minY = g_vertices[i][1];
	// 	}
	// }
	
	rangeX = maxX - minX;
	rangeY = maxY - minY;

	diff = rangeX > rangeY?(canvas.width / 3) / rangeX : (canvas.height / 3) / rangeY;
	
	// if(rangeX > rangeY)
	// {
	// 	diff = (canvas.width / 3) / rangeX;
	// }
	// else
	// {
	// 	diff = (canvas.height / 3) / rangeY;
	// }
	
	diff *= 100;
	graphicUtils_applyZoom(diff);
	
	graphicUtils_applyMove((canvas.width / 3) - (minX * diff), (canvas.height / 3) - (minY * diff), 0);
}

//calculate normals & scalar multiplication for perspective casting
function graphicUtils_checkPolygonsVisibility()
{
	var i, aX, aY, aZ, bX, bY, bZ, cX, cY, cZ, nX, nY, nZ;
	
	for(i = 0; i < g_polygons.length; i++)
	{
		var x = g_vertices[g_polygons[i][0] - 1][0];
		var y = g_vertices[g_polygons[i][0] - 1][1]
		var z = g_vertices[g_polygons[i][0] - 1][2];
		aX = x * (1 / (1 + (z / dDepth)));
		aY = y * (1 / (1 + (z / dDepth)));
		aZ = z;
		bX = g_vertices[g_polygons[i][1] - 1][0] * (1 / (1 + (g_vertices[g_polygons[i][1] - 1][2] / dDepth)));
		bY = g_vertices[g_polygons[i][1] - 1][1] * (1 / (1 + (g_vertices[g_polygons[i][1] - 1][2] / dDepth)));
		bZ = g_vertices[g_polygons[i][1] - 1][2];
		cX = g_vertices[g_polygons[i][2] - 1][0] * (1 / (1 + (g_vertices[g_polygons[i][2] - 1][2] / dDepth)));
		cY = g_vertices[g_polygons[i][2] - 1][1] * (1 / (1 + (g_vertices[g_polygons[i][2] - 1][2] / dDepth)));
		cZ = g_vertices[g_polygons[i][2] - 1][2];
		nX = ((bY - aY) * (cZ - aZ)) - ((bZ - aZ) * (cY - aY));
		nY = ((bZ - aZ) * (cX - aX)) - ((bX - aX) * (cZ - aZ));
		nZ = ((bX - aX) * (cY - aY)) - ((bY - aY) * (cX - aX));

        visiblePolygons[i] = ((nX * (canvas.width / 2)) + (nY * (canvas.height / 2)) + (nZ * (g_vertices[g_polygons[i][2] - 1][2] - dDepth)) < 0);
		
		// if((nX * (canvas.width / 2)) + (nY * (canvas.height / 2)) + (nZ * (g_vertices[g_polygons[i][2] - 1][2] - dDepth)) < 0)
		// {
		// 	visiblePolygons[i] = true;
		// }
		// else
		// {
		// 	visiblePolygons[i] = false;
		// }
	}
}

function graphicUtils_orderPolygonsByZ()
{
	g_polygons.sort(function(a,b){
			var i, minA = 0, minB = 0;
			
			//get minimal average z for each of the polygons by searching their vertices
			for(i = 0; i < a.length; i++)
			{
				minA += g_vertices[a[i] - 1][2];
			}			
			for(i = 0; i < b.length; i++)
			{
				minB += g_vertices[b[i] - 1][2];
			}
			
			//sort by ascending order
			return (minB / b.length) - (minA / a.length);
		});
}

function graphicUtils_drawPolygons()
{
	var i, j;
	
	if(g_casting == CASTING.PERSPECTIVE)
	{
		graphicUtils_checkPolygonsVisibility();
	}

    g_polygons.sort(function(a,b){
        var i, minA = 0, minB = 0;

        //get minimal average z for each of the polygons by searching their vertices
        for(i = 0; i < a.length; i++)
        {
            minA += g_vertices[a[i] - 1][2];
        }
        for(i = 0; i < b.length; i++)
        {
            minB += g_vertices[b[i] - 1][2];
        }

        //sort by ascending order
        return (minB / b.length) - (minA / a.length);
    });

	//graphicUtils_orderPolygonsByZ();

    // var myPix = function myPixel(x, y) {
    //     context.fillStyle = "#000";
    //     context.fillRect(x, y, 1, 1);
    //     //context.fillStyle="blue";
    //     //context.fill();
    // }

    // var myLin = function myLine( x1, y1, x2, y2 ){
    //     var dx = x1 - x2;
    //     var dy = y1 - y2;
    //     var steps = Math.max(Math.abs(dx), Math.abs(dy));
    //     var xIncrement = dx / steps;
    //     var yIncrement = dy / steps;
    //     var x = x1, y = y1;
    //     for (var i = 0; i < steps; i++) {
    //         x = x - xIncrement;
    //         y = y - yIncrement;
    //         myPix(Math.round(x), Math.round(y));
    //     }
    // }
	
	//draw by polygon
	for(i = 0; i < g_polygons.length; i++) {
		context.beginPath();
		var verX = g_vertices[g_polygons[i][0] - 1][0],
			verY = g_vertices[g_polygons[i][0] - 1][1],
			verXto = function(j) { return g_vertices[g_polygons[i][j] - 1][0]; },
			verYto = function(j) { return g_vertices[g_polygons[i][j] - 1][1]; },
			verZ = g_vertices[g_polygons[i][0] - 1][2];
		switch(g_casting) {
			case CASTING.PARALAL:

				context.moveTo(verX, verY);
				// for(j = 1; j < g_polygons[i].length; j++)
				// {
                 //    // myLin(g_vertices[g_polygons[i][0] - 1][0],
                 //    //     g_vertices[g_polygons[i][0] - 1][1],
                 //    //     g_vertices[g_polygons[i][j] - 1][0],
                 //    //     g_vertices[g_polygons[i][j] - 1][1]);
				// 	context.lineTo(g_vertices[g_polygons[i][j] - 1][0], g_vertices[g_polygons[i][j] - 1][1]);
				// }
                g_polygons[i].forEach(function(elemnt,j){
                    context.lineTo(verXto(j), verYto(j));
				});
				context.lineTo(verX, verY);
				break;
			case CASTING.DIAGONAL:
				context.moveTo(verX + (verZ * Math.cos(CAVALIER)), verY + (verZ * Math.sin(CAVALIER)));
				for(j = 1; j < g_polygons[i].length; j++)
				{
					context.lineTo(verXto(j) + (g_vertices[g_polygons[i][j] - 1][2] * Math.cos(CAVALIER)), verYto(j) + (g_vertices[g_polygons[i][j] - 1][2] * Math.sin(CAVALIER)));
				}					
				context.lineTo(verX + (verZ * Math.cos(CAVALIER)), verY + (verZ * Math.sin(CAVALIER)));
				break;
			case CASTING.PERSPECTIVE:
				if(visiblePolygons[i] == true)
				{
					context.moveTo(verX * (1 / (1 + (verZ / dDepth))), verY) * (1 / (1 + (verZ / dDepth)));
					for(j = 1; j < g_polygons[i].length; j++)
					{
						context.lineTo(verXto(j) * (1 / (1 + (g_vertices[g_polygons[i][j] - 1][2] / dDepth))), verYto(j)) * (1 / (1 + (g_vertices[g_polygons[i][j] - 1][2] / dDepth)));
					}					
					context.lineTo(verX * (1 / (1 + (verZ / dDepth))), verY) * (1 / (1 + (verZ / dDepth)));
				}
				break;
		}
		context.closePath();

		context.fillStyle="blue";
		context.fill();

		context.strokeStyle="black";
		context.stroke();
	}
}

function graphicUtils_applyMove(rangeX, rangeY, rangeZ)
{
	//var i;

    g_vertices.forEach(function(elemnt){
        elemnt[0] += rangeX;
        elemnt[1] += rangeY;
        elemnt[2] += rangeZ;
    });
	
	// for(i = 0; i < g_vertices.length; i++)
	// {
	// 	g_vertices[i][0] += rangeX;
	// 	g_vertices[i][1] += rangeY;
	// 	g_vertices[i][2] += rangeZ;
	// }
}

function graphicUtils_applyZoom(num)
{
	//var i;
	
	num /= 100;

    g_vertices.forEach(function(elemnt){
        elemnt[0] *= num;
        elemnt[1] *= num;
        elemnt[2] *= num;
	});
	
	// for(i = 0; i < g_vertices.length; i++)
	// {
	// 	g_vertices[i][0] *= num;
	// 	g_vertices[i][1] *= num;
	// 	g_vertices[i][2] *= num;
	// }
}

function graphicUtils_applyAngle(angle, axis)
{
	var i, x, y, z;
	
	angle = angle * (Math.PI / 180);
	
	graphicUtils_applyMove(-(canvas.width / 2), -(canvas.height / 2), 0);

	switch(axis)
	{
		case ROTATE.X:
			for(i = 0; i < g_vertices.length; i++)
			{
				y = g_vertices[i][1];
				z = g_vertices[i][2];
				g_vertices[i][1] = y * Math.cos(angle) - z * Math.sin(angle);
				g_vertices[i][2] = y * Math.sin(angle) + z * Math.cos(angle);
			}
			break;
		case ROTATE.Y:
			for(i = 0; i < g_vertices.length; i++)
			{
				x = g_vertices[i][0];
				z = g_vertices[i][2];
				g_vertices[i][0] = z * Math.sin(angle) + x * Math.cos(angle);
				g_vertices[i][2] = z * Math.cos(angle) - x * Math.sin(angle);
			}			
			break;
		case ROTATE.Z:
			for(i = 0; i < g_vertices.length; i++)
			{
				x = g_vertices[i][0];
				y = g_vertices[i][1];
				g_vertices[i][0] = x * Math.cos(angle) - y * Math.sin(angle);
				g_vertices[i][1] = x * Math.sin(angle) + y * Math.cos(angle);
			}			
			break;
	}
	
	graphicUtils_applyMove((canvas.width / 2), (canvas.height / 2), 0);
}
