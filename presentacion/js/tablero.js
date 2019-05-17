
/* eslint-disable no-undef */
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//camera.position.z = 400;
//camera.position.y = 70;
//camera.rotation.set(Math.Pi,  2, 0);
var controls = new THREE.OrbitControls(camera);
controls.minDistance = 20;
controls.maxDistance = 1000;
camera.rotation.order = 'YXZ';
camera.position.set(0, 100, 180);
camera.rotation.x = 5.6;
//console.log("Posicion camara X " +camera.rotation.x);
//console.log("Posicion camara Y " +camera.rotation.y);
//console.log("Posicion camara Z " +camera.rotation.z);

var material, mesh;
var geometryPelota, materialPelota, geometryPiso, materialPiso, piso, pelota, totalPelotas = 1; GameOver = false;
materialPelota = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x444444, specular: 0x555555, shininess: 200 });
geometryPelota = new THREE.SphereGeometry(2.25, 12, 12);
var rPad, lPad, geometryRPad, geometryLPad, materialRPad, materialLPad, rPadUp = false, lPadUp = false, rPadPos = new THREE.Vector3(19.9, 3.75, 72), lPadPos = new THREE.Vector3(-19.9, 3.75, 72),
    rPadRot = new THREE.Vector3(0, 0.5236, 0), lPadRot = new THREE.Vector3(0, -0.5236, 0);//+-30 * Math.PI/180
var cannonPalancaDerecha, cannonPalancaIzquierda;
var bumper;
var paredes = [];
var resorte, resorteAbajo = false;
var puntaje = 0, sumarPuntaje=false;
var matPelota, sphereBodyPelota,groundBody, reboteParedBody;
var light = new THREE.DirectionalLight(0xffffff);
var delay = 200;
var toques = 1; 
light.position.set(-200, 30, 100).normalize();
scene.add(light);

//1) Crear un mundo
var world = new CANNON.World();
//por defecto la gravedad esta en el eje z
world.gravity.set(0, 0, 60);
world.broadphase = new CANNON.NaiveBroadphase();
crearPelota();
crearTablero();
crearResorte();
//crearPared(300, 15, -85, 0, -40, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredIzquierda");//Pared izquierda
//crearPared(300, 15, 85, 0, -40, 0, Math.PI / 2, 0, parseInt('0xccffcc'), 'images/wall_texture.jpg', "paredDerecha");//Pared derecha
//crearPared(170, 15, 0, 0, -190, 0, 0, 0, parseInt('0xccffcc'), 'images/wall_texture.jpg', "paredAdelante");//Pared adelante
//crearPared(170, 15, 0, 0, 110, 0, 0, 0, parseInt('0xccffcc'), 'images/wall_texture.jpg', "paredAtras");//Pared atras
//crearPared(190, 280, 0, -7.5, -30, Math.PI / 2, 0, 0, parseInt('FA8072'), 'images/floor_texture.jpg', "piso"); //Piso


document.onkeydown = handleKeyDown;
document.onkeyup = handleKeyUp;

iniciarSonido("soundDisparoBola");
var cannonDebugRenderer = new THREE.CannonDebugRenderer(scene, world);
var dt = 1 / 120;

var render = function () {
   setTimeout(r,delay);
};
var r = function(){
    requestAnimationFrame(render);
    if(sumarPuntaje){
        puntaje+=1;
    }
    world.step(dt);
    sphereBodyPelota.position.y = 5;
    pelota.position.copy(sphereBodyPelota.position);

    // cannonDebugRenderer.update();
    //puntaje+=0.01;
    //Pongo la logica de las palancas aca
    if (lPadUp) {
        //console.log("lPaduUP RENDER");
        if (lPad.rotation.y <= 0.6764) {
            lPad.rotation.y += 0.2;

            //puntaje += 1;
            console.log(lPad.rotation.y);
            cannonPalancaIzquierda.quaternion.setFromEuler(lPad.rotation.x, lPad.rotation.y, lPad.rotation.z, 'XYZ');
        }
    } else {
        if (lPad.rotation.y >= -0.5236) {
            lPad.rotation.y -= 0.02;
            cannonPalancaIzquierda.quaternion.setFromEuler(lPad.rotation.x, lPad.rotation.y, lPad.rotation.z, 'XYZ');
        }
    }
    
    if (rPadUp) {
        //console.log("rrrrPaduUP RENDER");
        if (rPad.rotation.y >= -0.6764) {
            rPad.rotation.y -= 0.2;
            //puntaje -= 1;
            cannonPalancaDerecha.quaternion.setFromEuler(rPad.rotation.x, rPad.rotation.y, rPad.rotation.z, 'XYZ');
        }
    } else {
        if (rPad.rotation.y <= 0.5236) {
            rPad.rotation.y += 0.02;
            cannonPalancaDerecha.quaternion.setFromEuler(rPad.rotation.x, rPad.rotation.y, rPad.rotation.z, 'XYZ');
        }
    }
    
    //Pongo la lógica del resorte acá
    if (resorteAbajo) {
        if (resorte.position.z <= 90) {//Para que no baje despues de cierto limite
            resorte.position.z += 0.05;
            groundBody.position.copy(resorte.position);
        }
    }
    else {
        if (resorte.position.z > 77) {
            sumarPuntaje = true;
            resorte.position.z -= 0.8;
            groundBody.position.copy(resorte.position);
        }
    }

    //Listener de elementos para realizar puntajes
    reboteParedBody.addEventListener("collide", function (e) {
        //console.log("sphere collided")
        puntaje += 1;
        //console.log("Puntaje "+puntaje);
        //groundBody.collisionResponse = 0; // no impact on other bodys; 
    });

    //Verificar cuando una pelota pierde segun la posicion de esta en z
    if (!GameOver) {
        if (pelota.position.z > 108) { //Verificar esa posicion 108
            sumarPuntaje=false;
            totalPelotas -= 1;
            
            document.getElementById("pelotas").innerHTML = "Pelotas: " + totalPelotas;
            if (totalPelotas > 0) {
                pelota.position.set(60, 5, 60);
                sphereBodyPelota.position.set(60, 5, 65);
                //crearPelota();
            } else {
                GameOver = true;
                iniciarSonido("soundPerdio");
                setTimeout("location.reload(true);",3000);
            }
        }



    }

    document.getElementById("puntaje").innerHTML = "Puntaje: " + puntaje;
    renderer.render(scene, camera);
}
function crearTablero() {

    // Estructura del tablero
    crearPared(30, 10, -55, 0, 35, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredIzqRebIzq");//Pared izquierda al lado del rebote triangular izquierdo cerca a la palanca
    crearPared(37, 10, 55, 0, 31, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDerRebDer");//Pared derecha al lado del rebote triangular derecho cerca a la palanca

    crearPared(40, 10, 38, 0, 59, 0, Math.PI / 6, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiagPalDer");//Pared diagonal derecho al lado de la palanca derecha
    crearPared(40, 10, -38, 0, 59, 0, 5 * Math.PI / 6, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiagPalIzq");//Pared diagonal izquierda al lado de la palanca izquierda

    crearPared(58, 10, -40, 0, 76, 0, 2.64, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiagAbajoPalIzq");//Pared diagonal izquierda debajo de la palanca izquierda
    crearPared(50, 10, 36, 0, 76, 0, 0.58, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiagAbajoPalDer");//Pared diagonal derecha debajo de la palanca derecha

    crearPared(38, 10, 57, 0, 81, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredIzqPelota");//Pared izquierda pelota
    crearPared(38, 10, 63, 0, 81, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDerPelota");//Pared derecha pelota
    crearPared(6, 10, 60, 0, 100, 0, 0, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "pisoPelota");//Piso pelota

    crearPared(147, 10, 63, 0, -10, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredLargaDerecha");//Pared larga derecha

    crearPared(43, 10, -65, 0, 41, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "pared1Izq");//Pared 1 más izquierda de abajo a arriba
    crearPared(25, 10, -73, 0, 10, 0, 2.24, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag1TriangIzq");//Pared diagonal 1 de triangulo izquierdo
    crearPared(50, 10, -73, 0, -23, 0, 1.25, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag2TriangIzq");//Pared diagonal 2 de triangulo izquierdo
    crearPared(40, 10, -72, 0, -65, 0, 1.94, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag3TriangIzq");//Pared diagonal 3 arriba de triangulo izquierdo
    crearPared(25, 10, -80, 0, -95, 0, 1.64, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag4TriangIzq");//Pared diagonal 4 arriba de triangulo izquierdo

    crearPared(45, 10, -74, 0, -127, 0, 1.25, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag1CircIzq");//Pared diagonal 1 circulo de arriba a la izquierda
    crearPared(30, 10, -52, 0, -149, 0, 0.1, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag2CircIzq");//Pared diagonal 2 circulo de arriba a la izquierda
    crearPared(50, 10, -24, 0, -129.5, 0, 2.14, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag3CircIzq");//Pared diagonal 3 circulo de arriba a la izquierda
    crearPared(26, 10, -16, 0, -97, 0, 1.15, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag4CircIzq");//Pared diagonal 4 circulo de arriba a la izquierda

    crearPared(61, 10, 9, 0, -85, 0, 0, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredMitadArriba");//Pared de la mitad más arriba

    crearPared(45, 10, 32, 0, -105.5, 0, 1.94, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag1CircDer");//Pared diagonal 1 circulo de arriba a la derecha
    crearPared(45, 10, 31, 0, -147, 0, 1.25, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag2CircDer");//Pared diagonal 2 circulo de arriba a la derecha
    crearPared(25, 10, 50, 0, -168, 0, 0, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag3CircDer");//Pared diagonal 3 circulo de arriba a la derecha
    crearPared(45, 10, 70, 0, -147, 0, 1.95, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag4CircDer");//Pared diagonal 4 circulo de arriba a la derecha
    crearPared(45.5, 10, 70, 0, -105.5, 0, 1.24, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");//Pared diagonal 5 circulo de arriba a la derecha

    crearRebote(45, 10, 30, 0, 40, 0, 0.84, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");//Pared diagonal del rebote triangular derecho

    crearRebote(20, 10, 46, 0, 33, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");// Pared vertical del rebote triangular derecho
    crearRebote(48, 10, -29, 0, 42, 0, 2.24, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");//Pared diagonal del rebote triangular izquierda
    crearRebote(20, 10, -46, 0, 33, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");// Pared vertical del rebote triangular izquierda

    crearRebote(10, 10, 59, 0, 2, 0, 2.2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");// Pared diagonal abajo del rebote triangular cuando sale la pelota
    crearRebote(10, 10, 59, 0, -6, 0, 0.9, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");// Pared diagonal arriba del rebote triangular cuando sale la pelota

    crearRebote(21, 10, 45, 0, -36, 0, 0.6, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");// Pared diagonal arriba del rebote triangular cuando sale la pelota
    crearRebote(21, 10, 45, 0, -24, 0, 2.6, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");// Pared diagonal abajo del rebote triangular cuando sale la pelota

    crearRebote(43, 10, -64, 0, -7, 0, Math.PI / 2, 0, parseInt('0xccffcc'), '/images/wall_texture.jpg', "paredDiag5CircDer");// Pared diagonal arriba del rebote triangular cuando sale la pelota

    // Piso
    geometryPiso = new THREE.BoxGeometry(170, 4, 300);
    var texturePiso = new THREE.TextureLoader().load("images/floor_texture.jpg");
    materialPiso = new THREE.MeshBasicMaterial({ map: texturePiso, side: THREE.DoubleSide });
    piso = new THREE.Mesh(geometryPiso, materialPiso);
    //PhMesh.receiveShadow = true;
    piso.position.set(2.5, 0, -41);
    piso.name = "piso";
    scene.add(piso);

    var pisoBody;
    var pisoMaterial = new CANNON.Material();
    var pisoShape = new CANNON.Box(new CANNON.Vec3(170 / 2, 4 / 2, 300 / 2));
    //groundShape.rotation.copy(plane.rotation);
    pisoBody = new CANNON.Body({ mass: 0, shape: pisoShape, material: pisoMaterial });
    pisoBody.position.copy(piso.position);

    world.add(pisoBody);

    var mat1_piso = new CANNON.ContactMaterial(pisoMaterial, matPelota, { friction: 0.0, restitution: 0.0 });
    world.addContactMaterial(mat1_piso);

    var vidrioBody;
    var vidrioMaterial = new CANNON.Material();
    var vidrioShape = new CANNON.Box(new CANNON.Vec3(170 / 2, 1 / 2, 300 / 2));
    //groundShape.rotation.copy(plane.rotation);
    vidrioBody = new CANNON.Body({ mass: 0, shape: vidrioShape, material: vidrioMaterial });
    vidrioBody.position.copy(piso.position);

    world.add(vidrioBody);

    var mat1_vidrio = new CANNON.ContactMaterial(vidrioMaterial, matPelota, { friction: 0.0, restitution: 0.0 });

    vidrioBody.position.y += 10;
    world.addContactMaterial(mat1_vidrio);


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
    rPad.position.set(rPadPos.x, rPadPos.y, rPadPos.z+4);
    scene.add(rPad);

    // ==================================================================
    //se crea una superficie con la que la esfera va a tener contacto

    var wallMaterial = new CANNON.Material();
    var groundShape = new CANNON.Box(new CANNON.Vec3(30 / 2, 10 + 5, 3));
    //groundShape.rotation.copy(plane.rotation);
    cannonPalancaDerecha = new CANNON.Body({ mass: 0, shape: groundShape, material: wallMaterial, type: CANNON.Body.KINEMATIC });
    cannonPalancaDerecha.position.copy(rPad.position);
    cannonPalancaDerecha.quaternion.setFromEuler(rPad.rotation.x, rPad.rotation.y, rPad.rotation.z, 'XYZ');
    world.add(cannonPalancaDerecha);

     var mat1_wall = new CANNON.ContactMaterial(wallMaterial, matPelota, { friction: 0.0, restitution: 1 });
     world.addContactMaterial(mat1_wall);
// ==================================================================
    // Palanca izquierda
    geometryLPad = geometryRPad.clone();
    geometryLPad.applyMatrix(new THREE.Matrix4().makeRotationY(180 * Math.PI / 180));
    materialLPad = new THREE.MeshPhongMaterial({ color: 0xeeeeee, specular: 0x1c1c1c, shininess: 200 });
    lPad = new THREE.Mesh(geometryLPad, materialLPad);
    lPad.rotation.set(lPadRot.x, lPadRot.y, lPadRot.z);
    lPad.position.set(lPadPos.x, lPadPos.y, lPadPos.z+4 );
    scene.add(lPad);

    // ==================================================================
    //se crea una superficie con la que la esfera va a tener contacto

    var wallMaterial1 = new CANNON.Material();
    var groundShape1 = new CANNON.Box(new CANNON.Vec3(30 / 2, 10 + 5,3));
    //groundShape.rotation.copy(plane.rotation);
    cannonPalancaIzquierda = new CANNON.Body({ mass: 0, shape: groundShape1, material: wallMaterial1, type: CANNON.Body.KINEMATIC });
    cannonPalancaIzquierda.position.copy(lPad.position);
    cannonPalancaIzquierda.quaternion.setFromEuler(lPad.rotation.x, lPad.rotation.y, lPad.rotation.z, 'XYZ');
    world.add(cannonPalancaIzquierda);

     var mat1_wall1 = new CANNON.ContactMaterial(wallMaterial1, matPelota, { friction: 0.0, restitution: 1 });
     world.addContactMaterial(mat1_wall1);
// ==================================================================



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
    paredes.push(plane);
    crearFisicaPared(plane, width, height, rotationX, rotationY, rotationZ);
    scene.add(plane);
}
function crearFisicaPared(plane, width, height, rotationX, rotationY, rotationZ) {
    //se crea una superficie con la que la esfera va a tener contacto
    var wallBody;
    var wallMaterial = new CANNON.Material();
    var groundShape = new CANNON.Box(new CANNON.Vec3(width / 2, height + 5, 0.5));
    //groundShape.rotation.copy(plane.rotation);
    wallBody = new CANNON.Body({ mass: 0, shape: groundShape, material: wallMaterial });
    wallBody.position.copy(plane.position);
    wallBody.quaternion.setFromEuler(rotationX, rotationY, rotationZ, 'XYZ');
    world.add(wallBody);

    var mat1_wall = new CANNON.ContactMaterial(wallMaterial, matPelota, { friction: 0.5, restitution: 0.0 });
    world.addContactMaterial(mat1_wall);


}

function crearRebote(width, height, positionX, positionY, positionZ, rotationX, rotationY, rotationZ, colorPared, textura, nombre) {
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
    paredes.push(plane);
    crearFisicaRebote(plane, width, height, rotationX, rotationY, rotationZ);
    scene.add(plane);
}
function crearFisicaRebote(plane, width, height, rotationX, rotationY, rotationZ) {
    //se crea una superficie con la que la esfera va a tener contacto
    var wallMaterial = new CANNON.Material();
    var groundShape = new CANNON.Box(new CANNON.Vec3(width / 2, height + 5, 0.5));
    //groundShape.rotation.copy(plane.rotation);
    reboteParedBody = new CANNON.Body({ mass: 0, shape: groundShape, material: wallMaterial });
    reboteParedBody.position.copy(plane.position);
    reboteParedBody.quaternion.setFromEuler(rotationX, rotationY, rotationZ, 'XYZ');
    world.add(reboteParedBody);

    var mat1_wall = new CANNON.ContactMaterial(wallMaterial, matPelota, { friction: 0.0, restitution: 1 });
    world.addContactMaterial(mat1_wall);


}

function crearResorte() {
    var geometry = new THREE.BoxGeometry(6, 18, 8);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    resorte = new THREE.Mesh(geometry, material);
    resorte.position.set(60, 5, 77);
    resorte.rotation.set(-90 * Math.PI / 180, 0, 0);
    scene.add(resorte);
    crearFisicaResorte();
}
function crearFisicaResorte() {
    //se crea una superficie con la que la esfera va a tener contacto
    var groundMaterial = new CANNON.Material();
    var groundShape = new CANNON.Box(new CANNON.Vec3(3, 3, 10));
    groundBody = new CANNON.Body({ mass: 0, shape: groundShape, material: groundMaterial });
    groundBody.position.copy(resorte.position);
    //groundBody.position.z-=9;
    //var rot = new CANNON.Vec3(-90 * Math.PI / 180, 0, 0)
    //groundBody.quaternion.setFromAxisAngle(rot, (Math.PI / 2))
    world.add(groundBody);
    var mat1_ground = new CANNON.ContactMaterial(groundMaterial, matPelota, { friction: 0.0, restitution: 0
     }); //Restitution hace que rebote
    world.addContactMaterial(mat1_ground);
}
function crearPelota(ObjetoPelota) {
    pelota = new THREE.Mesh(geometryPelota, materialPelota);
    if (ObjetoPelota == undefined) {
        pelota.position.set(60, 5, 60); // Posicion de entrada
        //pelota.position.set(20, 5, 10); // Posicion de entrada
    } else {
        pelota.position.copy(ObjetoPelota.position).add(new THREE.Vector3(3, 0, 3));
    }
    scene.add(pelota);
    crearFisicaPelota();
}
function crearFisicaPelota() {
    matPelota = new CANNON.Material();
    var mass = 2, radius = 1;
    var sphereShape = new CANNON.Sphere(radius); // Step 1
    sphereBodyPelota = new CANNON.Body({ mass: mass, shape: sphereShape, material: matPelota }); // Step 2
    sphereBodyPelota.position.set(60, 5, 65);
    //sphereBodyPelotas[indiceShereBody].position.set(25, 5, -15);
    world.add(sphereBodyPelota); // Step 3

}
function crearRebotes(radioS, radioI, height, segRad, posX, posY, posZ) {
    bumper = new THREE.CylinderGeometry(radioS, radioI, height, segRad); //RadioArriba,RadioAbajo,Altura,SegmentosRadiales
    material = new THREE.MeshPhongMaterial({ color: 0x666666, specular: 0x999999, emissive: 0x000000, shininess: 10 });
    mesh = new THREE.Mesh(bumper, material);
    mesh.position.set(posX, posY, posZ);
    scene.add(mesh);
    crearFisicaRebotes(radioS, mesh);
}
function crearFisicaRebotes(radio, rebote) {
    var matRebote = new CANNON.Material();
    var mass = 0;
    console.log("Rebote posicion X " + rebote.position.x);
    console.log("Rebote posicion Y " + rebote.position.y);
    console.log("Rebote posicion Z " + rebote.position.z);
    var sphereShape = new CANNON.Sphere(radio + 3); // Step 1
    var reboteBdy = new CANNON.Body({ mass: mass, shape: sphereShape, material: matRebote }); // Step 2
    reboteBdy.position.copy(rebote.position);
    world.add(reboteBdy); // Step 3
    var mat1_ground = new CANNON.ContactMaterial(matRebote, matPelota, { friction: 0.0, restitution: 1 }); //Restitution hace que rebote
    world.addContactMaterial(mat1_ground);
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

    Shp = new THREE.Shape();
    Shp.moveTo(0, 0);
    Shp.lineTo(5, 5);
    Shp.lineTo(5, -5);
    Shp.lineTo(0, 0);
    extrudeSettings = { amount: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    geometry = new THREE.ExtrudeGeometry(Shp, extrudeSettings);
    mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
    mesh.rotation.set(-90 * Math.PI / 180, 0, 0);
    mesh.position.set(57, 2, -2);
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
        delay = delay + (toques * 0.5);
        toques++;
    if (data == "up")
        lPadUp = false;
        console.log("paliszq");
        
}
function actualizarPalancaDerecha(data) {
    console.log("En tablero, palanca derecha, imprimo " + data);
    if (data == "down")
        rPadUp = true;
        delay = delay + (toques * 0.5);
        toques++;
    if (data == "up")
        rPadUp = false;
}
function empujarResorte() {
    if (GameOver == true) {//Cuando se haya perdido el juego y se quiera volver a jugar
        //pelotas = [];
        //pelotas = 3;
        //crearPelota();
        //GameOver = false;
        //puntaje = 0;
        //document.getElementById("puntaje").innerHTML = "Puntaje: " + puntaje;
    } else {
        resorteAbajo = true;
    }

}
function dispararPelota(data) {
    //Aca me llegaria la potencia con la que deberia dispararse la pelota
    
    resorteAbajo = false;
    //Logica de disparo
    delay = delay + (toques * 0.5);
        toques++;
}
function tensionResorte(data){
    resorteAbajo = true;
    
}
function iniciarSonido(sonido) {
    if (document.getElementById(sonido).currentTime) {
        document.getElementById(sonido).currentTime = 0;
    }
    document.getElementById(sonido).volume = 0.5;
    document.getElementById(sonido).play();
}
render();

