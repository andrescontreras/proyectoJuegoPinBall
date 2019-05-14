
/* eslint-disable no-undef */
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//camera.position.z = 400;
//camera.position.y = 70;
camera.position.set(0, 100, 300);
//var controls = new THREE.OrbitControls(camera);
//controls.minDistance = 20;
//controls.maxDistance = 250;
var material, mesh;
var geometryPelota, materialPelota, geometryPiso, materialPiso, piso, pelotas = [], totalPelotas = 3, GameOver = false, turningFlips = [];
materialPelota = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x444444, specular: 0x555555, shininess: 200 });
geometryPelota = new THREE.SphereGeometry(2.25, 12, 12);
var rPad, lPad, geometryRPad, geometryLPad, materialRPad, materialLPad, rPadUp = false, lPadUp = false, rPadPos = new THREE.Vector3(19.9, 3.75, 72), lPadPos = new THREE.Vector3(-19.9, 3.75, 72),
    rPadRot = new THREE.Vector3(0, 0.5236, 0), lPadRot = new THREE.Vector3(0, -0.5236, 0);//+-30 * Math.PI/180
var bumper;
var resorte, resorteAbajo = false;

var light = new THREE.DirectionalLight(0xffffff);
light.position.set(-200, 30, 100).normalize();
scene.add(light);

crearTablero();
crearResorte();
crearPared(300, 15, -85, 0, -40, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredIzquierda");//Pared izquierda
crearPared(300, 15, 85, 0, -40, 0, Math.PI / 2, 0, parseInt('0xccffcc'), 'images/wall_texture.jpg', "paredDerecha");//Pared derecha
crearPared(170, 15, 0, 0, -190, 0, 0, 0, parseInt('0xccffcc'), 'images/wall_texture.jpg', "paredAdelante");//Pared adelante
crearPared(170, 15, 0, 0, 110, 0, 0, 0, parseInt('0xccffcc'), 'images/wall_texture.jpg', "paredAtras");//Pared atras
//crearPared(190, 280, 0, -7.5, -30, Math.PI / 2, 0, 0, parseInt('FA8072'), 'images/floor_texture.jpg', "piso"); //Piso
crearPelota();
document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;



var render = function () {
    requestAnimationFrame(render);

    //Pongo la logica de las palancas aca
    if (lPadUp) {
        console.log("lPaduUP RENDER");
        if (lPad.rotation.y <= 0.6764) {
            lPad.rotation.y += 0.1;
            console.log(lPad.rotation.y);
        }
    } else {
        if (lPad.rotation.y >= -0.5236) {
            lPad.rotation.y -= 0.1;
        }
    }
    if (rPadUp) {
        console.log("rrrrPaduUP RENDER");
        if (rPad.rotation.y >= -0.6764) {
            rPad.rotation.y -= 0.1;
        }
    } else {
        if (rPad.rotation.y <= 0.5236) {
            rPad.rotation.y += 0.1;
        }
    }
    //Pongo la lógica del resorte acá
    if (resorteAbajo) {
        if (resorte.position.z <= 90) {//Para que no baje despues de cierto limite
            resorte.position.z += 0.1;
        }
    }
    else {
        if (resorte.position.z >= 77) {
            resorte.position.z -= 1.2;
        }
    }



    renderer.render(scene, camera);
};
function crearTablero() {

    // Estructura del tablero
    var shape = new THREE.Shape();
    shape.moveTo(15, -90);
    shape.lineTo(57, -62.75);
    shape.lineTo(57, -90);
    shape.lineTo(63, -85);
    shape.lineTo(63, 85);
    shape.bezierCurveTo(105, //Punto 2 X
        180,//Punto 2 Y
        -3, //Punto 1 X
        180, //Punto 1 Y
        40, //CurrentPoint X
        85); // CurrentPoint Y
    shape.lineTo(-48, 85);
    shape.bezierCurveTo(15, //Punto 2 X
        180,//Punto 2 Y
        -93, //Punto 1 X
        180, //Punto 1 Y
        -80, //CurrentPoint X
        85); // CurrentPoint Y
    shape.lineTo(-65, 47.5);
    shape.lineTo(-80, 0);
    shape.lineTo(-65, -20);
    shape.lineTo(-65, -62.75);
    shape.lineTo(-15, -90);

    var points = shape.getPoints();

    var geometry = new THREE.BufferGeometry().setFromPoints(points);
    var material = new THREE.LineBasicMaterial({ color: 0xffffff });

    var line = new THREE.Line(geometry, material);
    line.rotation.set(-90 * Math.PI / 180, 0, 0);
    line.position.set(0, 3, 0);
    scene.add(line);

    // Piso
    geometryPiso = new THREE.BoxGeometry(170, 4, 300);
    var texturePiso = new THREE.TextureLoader().load("images/floor_texture.jpg");
    materialPiso = new THREE.MeshBasicMaterial({ map: texturePiso, side: THREE.DoubleSide });
    piso = new THREE.Mesh(geometryPiso, materialPiso);
    //PhMesh.receiveShadow = true;
    piso.position.set(2.5, 0, -41);
    piso.name = "piso";
    scene.add(piso);


    //Rebotes circulares
    crearRebotes(7, 7, 6, 8, 15.5, 5.6, -42.5);//Ultimos tres son Pos en x,y,z
    crearRebotes(7, 7, 6, 8, -15.5, 5.6, -42.5);//Ultimos tres son Pos en x,y,z
    crearRebotes(7, 7, 6, 8, 0, 5.6, -65.5);//Ultimos tres son Pos en x,y,z
    crearRebotes(7, 7, 6, 8, 52, 5.6, -125);//Ultimos tres son Pos en x,y,z
    crearRebotes(7, 7, 0.5, 8, -53, 5.6, -120);//Ultimos tres son Pos en x,y,z

    //Rebotes triangulares
    crearRebotesTriangulares();

    /*
    var geometryTecho = new THREE.BoxGeometry(130, 4, 180);
    var meshTecho= new THREE.Mesh(geometryTecho, materialPiso );
	meshTecho.position.set( 2.5, 12.75, -1 );
	meshTecho.visible = false; //
    scene.add( meshTecho ); 
    */
    // ------------------------------------- Palancas -----------------------------------
    shape = new THREE.Shape();
    shape.moveTo(-15, -1.5);
    shape.lineTo(0, -3);
    shape.bezierCurveTo(4.5, -3, 4.5, 3, 0, 3);
    shape.lineTo(-15, 1.5);
    shape.bezierCurveTo(-17, 0.75, -17, -0.75, -15, -1.5); // close
    var extrudeSettings = {
        depth: 3.5, bevelEnabled: false, bevelSegments: 1, bevelSize: 0.25, bevelThickness: 0.25, curveSegments: 6
    };

    // Palanca derecha
    geometryRPad = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometryRPad.applyMatrix(new THREE.Matrix4().makeRotationX(-90 * Math.PI / 180));
    materialRPad = new THREE.MeshPhongMaterial({ color: 0xcccccc, specular: 0x999999, shininess: 175 });
    rPad = new THREE.Mesh(geometryRPad, materialRPad);
    rPad.rotation.set(rPadRot.x, rPadRot.y, rPadRot.z);
    rPad.position.set(rPadPos.x, rPadPos.y, rPadPos.z);
    scene.add(rPad);

    // Palanca izquierda
    geometryLPad = geometryRPad.clone();
    geometryLPad.applyMatrix(new THREE.Matrix4().makeRotationY(180 * Math.PI / 180));
    materialLPad = new THREE.MeshPhongMaterial({ color: 0xeeeeee, specular: 0x1c1c1c, shininess: 200 });
    lPad = new THREE.Mesh(geometryLPad, materialLPad);
    lPad.rotation.set(lPadRot.x, lPadRot.y, lPadRot.z);
    lPad.position.set(lPadPos.x, lPadPos.y, lPadPos.z);
    scene.add(lPad);

    //Linea al lado de la palanca izquierda
    shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, -30);
    shape.lineTo(40, -52);
    points = shape.getPoints();
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    material = new THREE.LineBasicMaterial({ color: 0xffffff });
    line = new THREE.Line(geometry, material);
    line.rotation.set(-90 * Math.PI / 180, 0, 0);
    line.position.set(-55, 3, 20);
    scene.add(line);

    //Linea al lado de la palanca derecha
    shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0, -30);
    shape.lineTo(-40, -52);
    points = shape.getPoints();
    geometry = new THREE.BufferGeometry().setFromPoints(points);
    material = new THREE.LineBasicMaterial({ color: 0xffffff });
    line = new THREE.Line(geometry, material);
    line.rotation.set(-90 * Math.PI / 180, 0, 0);
    line.position.set(55, 3, 20);
    scene.add(line);

}
function crearPared(width, height, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, colorPared, textura, nombre) {

    var geometry = new THREE.PlaneGeometry(width, height);
    var texture = new THREE.TextureLoader().load(textura);
    var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    var plane = new THREE.Mesh(geometry, material);
    if (positionX != 0) { plane.position.x = positionX; }
    if (positionY != 0) { plane.position.y = positionY; }
    if (positionZ != 0) { plane.position.z = positionZ; }

    if (rotationX != 0) { plane.rotation.x = rotationX; }
    if (rotationY != 0) { plane.rotation.y = rotationY; }
    if (rotationZ != 0) { plane.rotation.z = rotationZ; }

    plane.name = nombre;

    scene.add(plane);
}
function crearResorte() {
    var geometry = new THREE.BoxGeometry(3, 18, 5);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    resorte = new THREE.Mesh(geometry, material);
    resorte.position.set(60, 5, 77);
    resorte.rotation.set(-90 * Math.PI / 180, 0, 0);
    scene.add(resorte);
}
function crearPelota(ObjetoPelota) {
    var pelota = new THREE.Mesh(geometryPelota, materialPelota);
    if (ObjetoPelota == undefined) {
        pelota.position.set(60, 5, 65); // Posicion de entrada
    } else {
        pelota.position.copy(ObjetoPelota.position).add(new THREE.Vector3(3, 0, 3));
    }
    scene.add(pelota);
    pelotas.push(pelota);
    pelota = null;
}
function crearRebotes(radioS, radioI, height, segRad, posX, posY, posZ) {
    bumper = new THREE.CylinderGeometry(radioS, radioI, height, segRad); //RadioArriba,RadioAbajo,Altura,SegmentosRadiales
    material = new THREE.MeshPhongMaterial({ color: 0x666666, specular: 0x999999, emissive: 0x000000, shininess: 10 });
    mesh = new THREE.Mesh(bumper, material);
    mesh.position.set(posX, posY, posZ);
    scene.add(mesh);
}
function crearRebotesTriangulares() {
    var Shp = new THREE.Shape();
    Shp.moveTo(-5, 1);
    Shp.lineTo(10, 11);
    Shp.bezierCurveTo(11, 11, 11, 11, 11, 10);
    Shp.lineTo(11, -10);
    Shp.bezierCurveTo(11, -11, 11, -11, 10, -11);
    Shp.lineTo(-5, -1);
    Shp.bezierCurveTo(-6, 0, -6, 0, -5, 1);
    var extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    var geometry = new THREE.ExtrudeGeometry(Shp, extrudeSettings);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
    mesh.rotation.set(-90 * Math.PI / 180, 0, 0);
    mesh.position.set(44, 2, -30);
    scene.add(mesh);


    Shp = new THREE.Shape();
    Shp.moveTo(-4, 0);
    Shp.lineTo(4, 25);
    Shp.lineTo(5, -15);
    Shp.lineTo(-4, 0);
    extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    geometry = new THREE.ExtrudeGeometry(Shp, extrudeSettings);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
    mesh.rotation.set(-90 * Math.PI / 180, 0, 0);
    mesh.position.set(-70, 2, -2);
    scene.add(mesh);

    Shp = new THREE.Shape();
    Shp.moveTo(0, 0);
    Shp.lineTo(0, -20);
    Shp.lineTo(30, -35);
    Shp.lineTo(0, 0);
    extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    geometry = new THREE.ExtrudeGeometry(Shp, extrudeSettings);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
    mesh.rotation.set(-90 * Math.PI / 180, 0, 0);
    mesh.position.set(-45, 2, 25);
    scene.add(mesh);

    Shp = new THREE.Shape();
    Shp.moveTo(0, 0);
    Shp.lineTo(0, -20);
    Shp.lineTo(-30, -35);
    Shp.lineTo(0, 0);
    extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    geometry = new THREE.ExtrudeGeometry(Shp, extrudeSettings);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
    mesh.rotation.set(-90 * Math.PI / 180, 0, 0);
    mesh.position.set(45, 2, 25);
    scene.add(mesh);
}
function handleKeyDown(e) {
    //console.log("Entro oprimo hacia abajo");
    if (e.keyCode == 37) {
        console.log("Izquierdo");
        lPadUp = true;

    }
    if (e.keyCode == 39) {
        console.log("Derecho");
        rPadUp = true;
        console.log(rPad.position.y);
    }
    if (e.keyCode == 40) {
        console.log("Fecha abajo");
        resorteAbajo = true;


    }
}

function handleKeyUp(e) {
    //console.log("Entro suelta el boton");
    if (e.keyCode == 37) {
        console.log("Suelta el boton Izquierdo");
        lPadUp = false;

    }
    if (e.keyCode == 39) {
        console.log("Suelta el boton Derecho");
        rPadUp = false;
    }
    if (e.keyCode == 40) {
        console.log("Suelta el boton Flecha Abajo");
        resorteAbajo = false;
    }

}
function actualizarPalancaIzquierda(data) {
    console.log("En tablero, palanca izquierda, imprimo " + data);
    if (data == "down")
        lPadUp = true;
    if (data == "up")
        lPadUp = false;
}
function actualizarPalancaDerecha(data) {
    console.log("En tablero, palanca derecha, imprimo " + data);
    if (data == "down")
        rPadUp = true;
    if (data == "up")
        rPadUp = false;
}
function empujarResorte() {
    resorteAbajo = true;
}
function dispararPelota(data) {
    //Aca me llegaria la potencia con la que deberia dispararse la pelota
    resorteAbajo = false;
    //Logica de disparo
}
render();

