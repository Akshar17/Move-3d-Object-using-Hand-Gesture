var gl;
var program;
var alpha;
var beta;
var gamma;
var tx,ty,tz;
var sx,sy,sz;
var items = new Array();
var i=0;
var socket;

function initGL(){
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, 512, 512);
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

	  alpha =0.0;
    beta = 0.0;
    gamma = 0.0;
    tx = 0.0;
    ty = 0.0;
    tz = 0.0;
    sx = 1.0;
    sy = 1.0;


    Md = [1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0,
          0.0,
          0.0,
          0.0,
          0.0,
          1.0];



    Mduniform = gl.getUniformLocation( program , "Md");


    gl.uniformMatrix4fv( Mduniform , false, flatten(Md));


    // will include depth test to render faces correctly!
    gl.enable( gl.DEPTH_TEST );

    setupTetrahedron();

    render();

}

function setupTetrahedron() {

    // Vertices of Tetrahedron


     var vertices = [vec4(0.0000, 0.0000, -0.2000 , 1.0) ,
    				         vec4(0.0000, 0.1885, 0.0666 , 1.0) ,
    				         vec4(-0.1633, -0.0942, 0.0666 , 1.0) ,
    				         vec4(0.1633, -0.0942, 0.0666 , 1.0)
    ];
    // Colors at Vertices of Tetrahedron

    var vertexColors = [vec4( 0.0, 0.0, 1.0, 1.0), // p0
                        vec4( 0.0, 1.0, 0.0, 1.0), // p1
                        vec4( 1.0, 0.0, 0.0, 1.0), // p2
                        vec4( 1.0, 1.0, 0.0, 1.0)]; // p3


    var indexList = [ 1, 2, 3,
    				2, 3, 0,
    				3, 0, 1,
    				0, 1, 2 ];


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertexBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var myPosition = gl.getAttribLocation( program, "myPosition" );
    gl.vertexAttribPointer( myPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myPosition );

    //var scalePositionPointer = gl.getUniformLocation ( program, "scalePosition");

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

    var myColor = gl.getAttribLocation( program, "myColor" );
    gl.vertexAttribPointer( myColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( myColor );

    // will populate to create buffer for indices
    var iBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, iBuffer );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indexList), gl.STATIC_DRAW );

    //readCoordinates();
}

function startRecording(){
  //items = [];
  console.log('Vefore connect');
  socket = io.connect('http://127.0.0.1:5000');
  console.log('After  connect');

  socket.emit('run', {run:true});

  socket.on('data points', function(msg){

    //console.log(msg);
    clipX = (2 * msg.x/512.0 - 1.0);
    clipY =-(2 * msg.y/512.0 - 1.0);
    //clipX = msg.x;
    //clipY = msg.y;
    //console.log(clipX,clipY);
    items.push(clipX+','+clipY);
    // items.push(clipY);
    // requestAnimFrame(newRender);
    //items = [];
  });
}

function render() {

  if(length(items)!=0){

      if(i<items.length-1){

        clipX = items[i].split(',')[0];
        clipY = items[i].split(',')[1];

        Md = [  1.0,
              0.0,
              0.0,
              0.0,

              0.0,
              1.0,
              0.0,
              0.0,

              0.0,
              0.0,
              1.0,
              0.0,

              clipX,
              clipY,
              0.0,
              1.0];
          gl.uniformMatrix4fv(Mduniform , false , flatten(Md));
          gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
         gl.drawElements( gl.TRIANGLES, 12, gl.UNSIGNED_BYTE, 0 );
        }
        i+=1
    }
    else{
      Md = [  1.0,
            0.0,
            0.0,
            0.0,

            0.0,
            1.0,
            0.0,
            0.0,

            0.0,
            0.0,
            1.0,
            0.0,

            0.0,
            0.0,
            0.0,
            1.0];
        gl.uniformMatrix4fv(Mduniform , false , flatten(Md));
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
       gl.drawElements( gl.TRIANGLES, 12, gl.UNSIGNED_BYTE, 0 );
    }
    requestAnimFrame(render);
}
