var width = window.innerWidth, height = window.innerHeight;
var scene, camera, renderer, controls;
var t0, dt;
var g, mass, e, c;
var radius, particle_color;


var animationFrame;
var stats;

window.onload = init;

function init(){

	initStats();

	setInitValue();

	initScene();

	pManager = new ParticleManager();
	pManager.initSpring(scene);
	// plane = new PlaneObject();
	// plane.init();
	// scene.add(plane.mesh_obj);
	planeToCube();

	createRope();
	
	// createFloor();

	showAixs();

	t0 = new Date().getTime(); 
	
	animFrame();
	initEvent();
}

function createFloor(){
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.z = -2;
	// floor.rotation.x = Math.PI / 2;
	scene.add(floor);
}

function createRope(){
	for(var i =0; i<6; i++){
		pManager.addParticle(scene, new THREE.Vector3(0.5, 0.5, 0.9-(0.15*i)), 1, 0.05, 0x0000FF);
	}
}
	

function setInitValue(){
	g = -10;
	mass = 1;
	k = 0.1;
	e = 0.8;
	c = 1;
	radius = 0.1
	particle_color = 0x006666;
}

function initEvent(){
	/* Create Button Click Event */
	document.getElementById("start").onclick = function(){
		console.log("Scene Start");
		animationFrame = requestAnimationFrame(animFrame);
	};
	document.getElementById("stop").onclick = function(){
		console.log("Scene Stop");
		cancelAnimationFrame(animationFrame);
	};
	/*
	document.getElementById("addParticle").onclick = function(){
		var pMass = document.getElementById("particleMass").value,
			pRadius = document.getElementById("particleRadius").value,
			pColor = "0x"+document.getElementById("particleColor").value;
		pManager.addParticle(scene, parseFloat(pMass), parseFloat(pRadius),parseInt(pColor,16));
	};
	document.getElementById("deleteParticle").onclick = function(){
		pManager.deleteParticle(scene);
	};
	*/
}

function initStats(){
	stats = new Stats();
	stats.setMode(0); // 0: fps, 1: ms

	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '8px';
	stats.domElement.style.top = '8px';

	document.body.appendChild( stats.domElement );

}

function animFrame(){
	stats.begin();
	onTimer();
	animationFrame = requestAnimationFrame(animFrame);
	stats.end();
}
function onTimer(){
	var t1 = new Date().getTime(); 
	dt = 0.0005*(t1-t0); 
	t0 = t1;
	if (dt>0.2) {dt=0;};

    move();    
}
function move(){
	
	if(pManager.length !== 0 ){
		for(var i = 0; i < pManager.length; i++){
			CollisionHandler.collisionBetweenParticleAndPlanes(i, pManager.particles_array,cube);
			CollisionHandler.collisionBetweenParticles(i,pManager.particles_array);
			// CollisionHandler.collisionInRope(i,pManager.particles_array);
			pManager.particles_array[i].moveObject();
		}
	}
	
	/*
	if(pManager.length !== 0 ){
		for(var i = 0; i < pManager.length; i++){
			// CollisionHandler.collisionBetweenParticleAndPlane(pManager.particles_array[i],cube[2]);
			CollisionHandler.collisionBetweenParticleAndPlane(i, pManager.particles_array,cube[2]);
			CollisionHandler.collisionBetweenParticles(i,pManager.particles_array);
			pManager.particles_array[i].moveObject();
		}
	}
	*/
	pManager.updateSpring(scene);
	controls.update();
	renderer.render(scene, camera);	
}

function particleProjectToPlaneCordinate(particleObj, planeObj){
	var particlePositionMinusP = new THREE.Vector3();
	particlePositionMinusP.subVectors(particleObj.pos, planeObj.p);

	var uLengthSq = planeObj.u.lengthSq(),
		vLengthSq = planeObj.v.lengthSq(),
		s,
		t,
		result;
	s = (1/((uLengthSq * vLengthSq) - Math.pow(planeObj.uDotV,2))) * ( (planeObj.u.clone().multiplyScalar(vLengthSq)).sub(planeObj.v.clone().multiplyScalar(planeObj.uDotV)).dot(particlePositionMinusP));
	t = (1/((uLengthSq * vLengthSq) - Math.pow(planeObj.uDotV,2))) * ( (planeObj.u.clone().multiplyScalar(-planeObj.uDotV)).add(planeObj.v.clone().multiplyScalar(uLengthSq)).dot(particlePositionMinusP));
	result = planeObj.planeEquation(s,t);
	
	return result;
}

function showAixs(){
	var origin = new THREE.Vector3( 0, 0, 0 );
	var xAixs = new THREE.Vector3(1,0,0);
	var arrowX = new THREE.ArrowHelper( xAixs, origin, 1, 0xff0000 );//Red
	scene.add(arrowX);
	var yAixs = new THREE.Vector3(0,1,0);
	var arrowY = new THREE.ArrowHelper( yAixs, origin, 1, 0xffff00 );//Yellow
	scene.add(arrowY);
	var zAixs = new THREE.Vector3(0,0,1);
	var arrowZ = new THREE.ArrowHelper( zAixs, origin, 1, 0xffffff );//white
	scene.add(arrowZ);
}


function initScene(){
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	var angle = 45, aspect = width/height, near = 0.1, far = 20000;
	camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
	// camera.position.set(1,0,7);
	camera.position.set(0,-2.5,4);
	// camera.up = new THREE.Vector3(0,0,0);
	scene.add(camera);
	
	var light = new THREE.DirectionalLight();
	light.position.set(-10,0,20);
	scene.add(light);

	controls = new THREE.OrbitControls(camera, renderer.domElement);

}

