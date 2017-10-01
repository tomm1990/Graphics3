/********************************
 *
 *       Graphics Ex3 By
 *   Daniel Shamama 305261794
 *      Noam Roiz 301885943
 *    Tom Goldberg 302815279
 *
 ********************************/

'use strict';

const canvas            = document.getElementById('canv');
const ortBtn            = document.getElementById('Orthographic');
const oblBtn            = document.getElementById('Oblique');
const presBtn           = document.getElementById('Perspective');
//const jsonInput         = document.getElementById('shapeData');
const resetBtn          = document.getElementById('resetBtn');
const ctx               = canvas.getContext("2d");
const COLOR             = '#ccc';
const STROKE_COLOR      = '#000';
const zDepth            = 1500;
const OBLIQUE_ANGLE     = 45/180 * Math.PI;
const AXIS              = { X: 1, Y: 2, Z: 3 };
const DRWING_OPTS       = { PARALLEL_ORTHOGRAPHIC : 1, PARALLEL_OBLIQUE : 2, PERSPECTIVE : 3 };
let CUR_DRAWING_OPT     = DRWING_OPTS.PERSPECTIVE;
let middle              = { x:-1, y:-1 };
let range               = { maxX:0, maxY:0, minX:900, minY:550 };
let vertices            = [];
let polygons            = [];

resetBtn.addEventListener('click', (e) => {
    reset();
});

ortBtn.addEventListener('click', (e) => {
    changeDrawMode(DRWING_OPTS.PARALLEL_ORTHOGRAPHIC);
});

oblBtn.addEventListener('click', (e) => {
    changeDrawMode(DRWING_OPTS.PARALLEL_OBLIQUE);
});

presBtn.addEventListener('click', (e) => {
    changeDrawMode(DRWING_OPTS.PERSPECTIVE);
});

//loading coordinates files when the input changed
//jsonInput.addEventListener('change', (e) => {
//    let file = jsonInput.files[0];
//
//    if (file.type.match(/json.*/)) {
//        let reader = new FileReader();
//        reader.onload = () => {
//            let data = JSON.parse(reader.result);
//            if(data.polygons && data.vertices){
//                polygons = data.polygons;
//                vertices = data.vertices;
//                middleCalc();
//                clear();
//                draw();
//            } else {
//                alert("File structure doesn't fit. make sure it contains polygons and vertices properties");
//            }
//        };
//        reader.readAsText(file);
//    } else {
//        alert("File type must be JSON");
//    }
//});

function reset(){
    clear();
    //jsonInput.value = "";
    
    let json = {
        "vertices": [
            [100, 100, 100],
            [200, 100, 100],
            [100, 200, 100],
            [200, 200, 100],
            [100, 100, 200],
            [200, 100, 200],
            [100, 200, 200],
            [200, 200, 200],
            [300, 100, 123],
            [323, 123, 223],
            [400, 100, 173],
            [350, 200, 173]
        ],
        "polygons": [
            [0, 2, 3, 1],
            [1, 3, 7, 5],
            [0, 4, 6, 2],
            [0, 1, 5, 4],
            [2, 6, 7, 3],
            [4, 5, 7, 6],
            [10, 9, 8],
            [9, 10, 11],
            [8, 9, 11],
            [8, 10, 11]
        ]
    };
    
    if(json.polygons && json.vertices){
        polygons = json.polygons;
        vertices = json.vertices;
        middleCalc();
        clear();
        draw();
    } else {
        alert("File structure doesn't fit. make sure it contains polygons and vertices properties");
    }

}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

//calculates all the end points of the portrait to 'range' object and calculates the center coordinate of the portrait
function middleCalc() {
    range.maxX = 0;
    range.maxY = 0;
    range.minX = 900;
    range.minY = 550;

    for(let vert of vertices){
        let x = vert[0];
        let y = vert[1];
        if (x > range.maxX) range.maxX = x;
        if (x < range.minX) range.minX = x;
        if (y > range.maxY) range.maxY = y;
        if (y < range.minY) range.minY = y;
    }

    //calculating middle of the portrait
    middle.x = (range.maxX+range.minX) / 2;
    middle.y = (range.maxY+range.minY) / 2;
}

// helping calculate the normal variable by the diff of polygons
function getNormalVer(vera, verb) {
    let vp = {x:-1,y:-1,z:-1};
    // difference between polygons
    vp.x = vertices[verb][0] - vertices[vera][0];
    vp.y = vertices[verb][1] - vertices[vera][1];
    vp.z = vertices[verb][2] - vertices[vera][2];
    return vp;
}

// calculates normal by a given polygon parameter
function calcNormal(polygon) {
    //now we need three vertices from each polygon in order to calculate each shape's Normal
    let vecA = getNormalVer(polygon[0],polygon[1]),
        vecB = getNormalVer(polygon[0],polygon[2]),
        vecC = getNormalVer(polygon[1],polygon[2]);

    // product a with b into normal1
    let normal1 = {x:-1,y:-1,z:-1};
    normal1.x = ( vecA.y*vecB.z - (vecA.z * vecB.y) );
    normal1.y = - (vecA.x*vecB.z - (vecA.z * vecB.x));
    normal1.z = ( vecA.x*vecB.y - ( vecA.y * vecB.x ));

    // product a with c into normal2
    let normal2 = {x:-1,y:-1,z:-1};
    normal2.x = ( vecA.y*vecC.z - (vecA.z * vecC.y) );
    normal2.y = - (vecA.x*vecC.z - (vecA.z * vecC.x));
    normal2.z = ( vecA.x*vecC.y - ( vecA.y * vecC.x ));

    // product normal1 with normal2 into normal3
    let normal3 = {x:-1,y:-1,z:-1};
    normal3.x = ( normal1.y*normal2.z - (normal1.z * normal2.y) );
    normal3.y = - (normal1.x*normal2.z - (normal1.z * normal2.x));
    normal3.z = ( normal1.x*normal2.y - ( normal1.y * normal2.x ));

    // calculates normal absolute size
    let normalSize = Math.sqrt( Math.pow(normal3.x,2),Math.pow(normal3.y,2),Math.pow(normal3.z,2) );

    // console.log(`normalSize -> ${normalSize}`);

    return normalSize;
}

// sorts the polygons collection by thair depth
function depthSorting() {
    polygons.sort( (a, b) => {
        let aDepth = 0, bDepth = 0;
        for (let i of a) aDepth += vertices[i][2];
        for (let j of b) bDepth += vertices[j][2];
        return ( aDepth / a.length ) - ( bDepth / b.length );
    });
}

// Drawing the 3D picture - ( Entry function )
function draw() {

    //ordering the shapes by depth
    depthSorting();

    //drawing each polygon
    for(let polygon of polygons) {

        let x1, y1, x2, y2, verticeA, verticeB;
        ctx.beginPath();

        //the first vertice of the selected polygon
        verticeA = vertices[polygon[0]];

        // check the picked drawing option
        if (CUR_DRAWING_OPT === DRWING_OPTS.PERSPECTIVE) {

            x1 = verticeA[0] * (1/(1 + verticeA[2]/zDepth));
            y1 = verticeA[1] * (1/(1 + verticeA[2]/zDepth));

        } else if (CUR_DRAWING_OPT === DRWING_OPTS.PARALLEL_ORTHOGRAPHIC) {

            // calculate the polygon normal
            if (calcNormal(polygon) < 0) continue;

            x1 = verticeA[0];
            y1 = verticeA[1];

        } else { // drawing parallel oblique

            // check the polygon normal
            if (calcNormal(polygon) < 0) continue;

            x1 = verticeA[0] + verticeA[2] * Math.cos(OBLIQUE_ANGLE);
            y1 = verticeA[1] + verticeA[2] * Math.sin(OBLIQUE_ANGLE);
        }

        //stating point of the polygon
        ctx.moveTo(x1,y1);

        // connect all points of the polygon
        for (const v of polygon) {
            verticeB = vertices[v];
            if (CUR_DRAWING_OPT === DRWING_OPTS.PERSPECTIVE) {
                x2 = verticeB[0] * (1/(1 + verticeB[2]/zDepth));
                y2 = verticeB[1] * (1/(1 + verticeB[2]/zDepth));
            } else if (CUR_DRAWING_OPT === DRWING_OPTS.PARALLEL_ORTHOGRAPHIC) {
                x2 = verticeB[0];
                y2 = verticeB[1];
            } else {//drawing parallel oblique
                x2 = verticeB[0] + verticeB[2] * Math.cos(OBLIQUE_ANGLE);
                y2 = verticeB[1] + verticeB[2] * Math.sin(OBLIQUE_ANGLE);
            }
            ctx.lineTo(x2,y2);
        }

        //close to the start point
        ctx.lineTo(x1, y1);
        ctx.closePath();
        ctx.fillStyle = COLOR;
        ctx.strokeStyle = STROKE_COLOR;
        ctx.fill();
        ctx.stroke();
    }
}

function changeDrawMode(drawOption) {
    CUR_DRAWING_OPT = drawOption;
    clear();
    if (vertices.length > 0 && polygons.length > 0) draw();
}

function scale() {
    let scaleValue = document.getElementById('scaleRange').value;

    if(scaleValue > 10 || scaleValue < 0.1){
        alert("Not a good scale value");
    } else {
        for(let vert of vertices) {
            let x = vert[0] - middle.x,
                y = vert[1] - middle.y,
                z = vert[2];

            vert[0] = (scaleValue * x) + middle.x;
            vert[1] = (scaleValue * y) + middle.y;
            vert[2] = scaleValue * z;
        }
        clear();
        draw();
    }
}

function rotate(axis) {
    //rotate's degree value
    let degreeValue = document.getElementById('rotateDegree').value;

    // if value is offset
    degreeValue = degreeValue > 360 ? degreeValue-=360 :
        degreeValue < -360 ? degreeValue += 360 :
            degreeValue;

    // calculate degree to rad
    degreeValue = degreeValue / 180 * Math.PI;

    // calculates next 3d points
    for( let [index, val] of vertices.entries()) {

        let x = val[0] - middle.x,
            y = val[1] - middle.y,
            z = val[2];

        if (axis === AXIS.X) {

            val[1] = (y * Math.cos(degreeValue) - z * Math.sin(degreeValue)) + middle.y;
            val[2] = (y * Math.sin(degreeValue) + z * Math.cos(degreeValue));

        } else if (axis === AXIS.Y) {

            val[0] = (x * Math.cos(degreeValue) - z * Math.sin(degreeValue)) + middle.x;
            val[2] = (x * Math.sin(degreeValue) + z * Math.cos(degreeValue));

        } else if(axis === AXIS.Z) {

            val[0] = (x * Math.cos(degreeValue) - y * Math.sin(degreeValue)) + middle.x;
            val[1] = (x * Math.sin(degreeValue) + y * Math.cos(degreeValue)) + middle.y;

        } else {
            alert("Invalid exis");}
    }
    clear();
    draw();
}