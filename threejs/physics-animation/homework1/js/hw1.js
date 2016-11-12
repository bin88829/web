var width = window.innerWidth, height = window.innerHeight;
var scene, camera, renderer, controls;
var t0, dt;
var g, mass, e, c;
var radius, particle_color;

window.onload = init;

function init(){

	setInitValue();

	// isRedraw();

	initScene();

	particle = new ParticleObject();
	particle.init();
	scene.add(particle.mesh_obj);

	plane = new PlaneObject();
	plane.init();
	scene.add(plane.mesh_obj);


	// scene.add(plane);

	showAixs();

	t0 = new Date().getTime();
	animFrame();

	// renderer.render(scene, camera);
}

function animFrame(){
	requestAnimationFrame(animFrame);
	onTimer();
}
function onTimer(){
	var t1 = new Date().getTime();
	dt = 0.001*(t1-t0);
	t0 = t1;
	if (dt>0.2) {dt=0;};
	move();
}
function move(){
	// EulerExplicit(particle);
	// var projected_postion = particleProjectToPlaneCordinate(particle,plane);

	// if(isCollision(particle,projected_postion,plane)){


	// }
	isOnPlaneCollision(particle,plane);

	particle.moveObject();
	controls.update();
	renderer.render(scene, camera);
}

function EulerExplicit(obj){
	acc = getAcc(obj.pos.clone(),obj.velo.clone());
	obj.pos=obj.pos.add(obj.velo.clone().multiplyScalar(dt));
	obj.velo=obj.velo.add(acc.clone().multiplyScalar(dt));
}
function getAcc(pos,vel){
	calcForce(pos,vel);
	return force.multiplyScalar(1/mass);
}
function calcForce(pos,vel){
	var gravity = Forces3.constantGravity(mass,g);
	// var drag = Forces3D.linearDrag(k,vel);
	// force = Forces3D.add([gravity, drag]);
	force = Forces3.add([gravity]);
}

function isCollision(particleObj,projectedPos,planeObj){
	var distanceParticleAndProjection = particleObj.pos.distanceTo(projectedPos);
	if(distanceParticleAndProjection < radius){
		console.log("collision with infinite plane");
		if(isOnPlaneCollision(particleObj,planeObj)){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}

function isOnPlaneCollision(particleObj, planeObj){
	// console.log(obj);
	var particlePositionMinusP = particleObj.pos.clone().sub(planeObj.p); //b
	var particlePositionBeforeCollision = particleObj.pos.clone(); //x(tn)

	var particleVelocityBeforeCollision = particleObj.velo.clone();
	var normalVelocityBeforeCollision = planeObj.normal_vector.clone().multiplyScalar(particleVelocityBeforeCollision.dot(planeObj.normal_vector));
	var planeVelocityBeforeCollision = particleVelocityBeforeCollision.clone().sub(normalVelocityBeforeCollision);

	// var objClone = obj.clone();
	// console.log(objClone);
	EulerExplicit(particleObj);

	var particlePositionAfterCollision = particleObj.pos.clone();

	var veloVec3AfterCollision = normalVelocityBeforeCollision.clone().multiplyScalar(-e).add(planeVelocityBeforeCollision.clone().multiplyScalar(c));

	var a = new THREE.Vector3();
	a.subVectors(particlePositionBeforeCollision,particlePositionAfterCollision);

	var aCrossB = new THREE.Vector3();
	aCrossB.crossVectors(a, particlePositionMinusP);
	var uCrossVDotA = planeObj.uCrossV.dot(a);

	var s = aCrossB.dot(planeObj.v) / uCrossVDotA;
	var t = (-1 * aCrossB.dot(planeObj.u)) / uCrossVDotA
	var lamda =  planeObj.uCrossV.dot(particlePositionMinusP)/ uCrossVDotA;

	var posVec3AfterCollision = new THREE.Vector3();
	posVec3AfterCollision.addVectors(particlePositionBeforeCollision,veloVec3AfterCollision.clone().multiplyScalar((1-lamda)*dt));

	if((0 <= s && s <= 1) && (0 <= t && t <= 1) && (0 <= lamda && lamda <= 1)){
		console.log("Collision occur on the Finite Plane");
		particleObj.velo = veloVec3AfterCollision;
		particleObj.pos = posVec3AfterCollision;
		return true;
	}else{
		return false;
	}
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

function PlaneObject(){
	this.p;
	this.q;
	this.r;
	this.u;
	this.v;
	this.uCrossV;
	this.uDotV;
	this.normal_vector;
};
PlaneObject.prototype = {
	mesh_obj: null,

	init: function(){
		this.p = setRandomVector3(-1.5,-1.0,-1.5,-1.0,-0.2,0.2);
		this.q = setRandomVector3(1.0,1.5,-1.5,-1.0,-0.2,0.2);
		this.r = setRandomVector3(1.0,-1.5,1.0,1.5,-0.2,0.2);
		// this.p = new THREE.Vector3(1,0,0);
		// this.q = new THREE.Vector3(0,1,0);
		// this.r = new THREE.Vector3(0,0,1);
		this.u = new THREE.Vector3();
		this.u.subVectors(this.q,this.p);
		this.v = new THREE.Vector3();
		this.v.subVectors(this.r,this.p);
		this.uCrossV = new THREE.Vector3();
		this.uCrossV.crossVectors(this.u,this.v);
		this.normal_vector = this.uCrossV.clone().normalize();

		this.uDotV = this.u.dot(this.v);

		var planeGeometry = new THREE.PlaneGeometry();
		planeGeometry.vertices[0]=this.planeEquation(0,0);
		planeGeometry.vertices[1]=this.planeEquation(0,1);
		planeGeometry.vertices[2]=this.planeEquation(1,0);
		planeGeometry.vertices[3]=this.planeEquation(1,1);

		this.mesh_obj = new THREE.Mesh(planeGeometry,new THREE.MeshNormalMaterial());

	},
	planeEquation: function(s,t){
		var result;
		result = this.p.clone().add(this.u.clone().multiplyScalar(s)).add(this.v.clone().multiplyScalar(t));
		return result;
	}
};

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

function setInitValue(){
	g = -10;
	mass = 1;
	k = 0.1;
	e = 0.8;
	c = 1;
	radius = 0.1
	particle_color = 0x006666;
}
function isRedraw(){
	var canvas = document.getElementsByTagName("canvas")
	if(canvas.length !== 0){
		canvas[0].remove();
	}
}
function initScene(){
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	var angle = 45, aspect = width/height, near = 0.1, far = 20000;
	camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
	camera.position.set(1,0,7);
	scene.add(camera);

	var light = new THREE.DirectionalLight();
	light.position.set(-10,0,20);
	scene.add(light);

	controls = new THREE.OrbitControls(camera, renderer.domElement);

}
function ParticleObject(){
	this.mesh_obj;
	this.pos;
	this.velo;
};
ParticleObject.prototype = {
	mesh_obj: null,
	pos: null,
	velo: null,
	setPos :function(vec3){
		this.pos = vec3;
	},
	setVelo: function(vec3){
		this.velo = vec3;
	},
	moveObject: function(){
		this.mesh_obj.position.set(this.pos.x, this.pos.y, this.pos.z);
	},
	init: function(r, c){ /*r, c optional*/
		if (r === undefined) r = radius;
		if (c === undefined) c = particle_color;
		var sphereGeometry = new THREE.SphereGeometry(r,20,20);
		var sphereMaterial = new THREE.MeshLambertMaterial({ color: c });
		this.mesh_obj = new THREE.Mesh(sphereGeometry,sphereMaterial);

		//set Initial Random Position
		var init_position_vec3 = setRandomVector3(-0.2,0.2,-0.2,0.2,2.0,3.0);
		this.setPos(init_position_vec3);
		this.moveObject();

		var init_velocity_vec3 = setRandomVector3(-0.1,0.1,-0.1,0.1,-0.1,0.1);
		this.setVelo(init_velocity_vec3);
	}
};

function setRandomVector3(minX,maxX,minY,maxY,minZ,maxZ){
	var x = getRandomFloat(minX,maxX),
		y = getRandomFloat(minY,maxY),
		z = getRandomFloat(minZ,maxZ);
	return new THREE.Vector3(x,y,z);
}
function getRandomFloat(min, max){
	var random = Math.random() * (max - min) + min;
	return parseFloat(random.toFixed(1));
}