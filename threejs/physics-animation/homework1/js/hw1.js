var width = window.innerWidth, height = window.innerHeight;
var scene, camera, renderer;
var particle, projectedParticle,
	plane, p, q, r, planeCenterPoint;
var t0, dt;
var g, mass, e, c;
var fac = 0.9;
var radius = 0.1;
var x0 = -100, y0 = -100, z0 = -100;
var u, v, uLengthSq, vLengthSq, uDotV;

window.onload = init;

function init() {
	g = -10;
	mass = 1;
	k = 0.1;
	e = 1;
	c = 1;//friction

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	var angle = 45, aspect = width/height, near = 0.1, far = 10000;
	camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
	// camera.position.set(-1,-3,7);
	camera.position.set(1,0,7);
	// camera.rotateY(-0.3);
	// camera.rotateX(0.3);
	// camera.rotateZ(0.5);
	scene.add(camera);

	var light = new THREE.DirectionalLight();
	light.position.set(-10,0,20);
	scene.add(light);

	var sphereGeometry = new THREE.SphereGeometry(radius,20,20);
	var sphereMaterial = new THREE.MeshLambertMaterial({color: 0x006666});

	particle = new THREE.Mesh(new THREE.SphereGeometry(0.1,20,20),sphereMaterial);
	scene.add(particle);
	var particleInitPos = setRandomVector(-0.2,0.2,-0.2,0.2,2.0,3.0);
	particle.pos = new Vector3D(particleInitPos.x,particleInitPos.y,particleInitPos.z);
	positionObject(particle);
	var particleInitVelo = setRandomVector(-0.1,0.1,-0.1,0.1,-0.1,0.1);
	particle.velo = new Vector3D(particleInitVelo.x,particleInitVelo.y,particleInitVelo.z);

	var pPos = setRandomVector(-1.5,-1.0,-1.5,-1.0,-0.2,0.2);
	p = new Vector3D(pPos.x, pPos.y, pPos.z);
	var qPos = setRandomVector(1.0,1.5,-1.5,-1.0,-0.2,0.2);
	q = new Vector3D(qPos.x, qPos.y, qPos.z);
	var rPos = setRandomVector(1.0,-1.5,1.0,1.5,-0.2,0.2);
	r = new Vector3D(rPos.x, rPos.y, rPos.z);

	//helper
	var origin = new THREE.Vector3( 0, 0, 0 );
	var xAixs = new THREE.Vector3(1,0,0);
	var arrowX = new THREE.ArrowHelper( xAixs, origin, 0.5, 0xff0000 );//Red
	scene.add(arrowX);
	var yAixs = new THREE.Vector3(0,1,0);
	var arrowY = new THREE.ArrowHelper( yAixs, origin, 0.5, 0xffff00 );//Yellow
	scene.add(arrowY);
	var zAixs = new THREE.Vector3(0,0,1);
	var arrowZ = new THREE.ArrowHelper( zAixs, origin, 0.5, 0xffffff );//white
	scene.add(arrowZ);

	pVector3 = new THREE.Vector3(p.x,p.y,p.z);
	qVector3 = new THREE.Vector3(q.x,q.y,q.z);
	rVector3 = new THREE.Vector3(r.x,r.y,r.z);
	/*
	 var arrowP = new THREE.ArrowHelper( pVector3, origin, pVector3.length(), 0x00ffff );
	 scene.add(arrowP);
	 var arrowQ = new THREE.ArrowHelper( qVector3, origin, qVector3.length(), 0x00ffff );
	 scene.add(arrowQ);
	 var arrowR = new THREE.ArrowHelper( rVector3, origin, rVector3.length(), 0x00ffff );
	 scene.add(arrowR);
	 */
	uVector3 = new THREE.Vector3();
	uVector3.subVectors(qVector3,pVector3);
	vVector3 = new THREE.Vector3();
	vVector3.subVectors(rVector3,pVector3);
	uCrossV = new THREE.Vector3();
	uCrossV.crossVectors(uVector3,vVector3);
	planeNormalVector = uCrossV.clone().normalize();

	var lineGeometry = new THREE.Geometry();
	lineGeometry.vertices.push(pVector3);
	lineGeometry.vertices.push(qVector3);
	lineGeometry.vertices.push(rVector3);
	var material = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});
	var line = new THREE.Line(lineGeometry, material);
	scene.add(line);

	var planeGeometry = new THREE.PlaneGeometry();
	planeGeometry.vertices[0]=convertV3dToV3(planeEquation(0,0));
	planeGeometry.vertices[1]=convertV3dToV3(planeEquation(0,1));
	planeGeometry.vertices[2]=convertV3dToV3(planeEquation(1,0));
	planeGeometry.vertices[3]=convertV3dToV3(planeEquation(1,1));

	var plane = new THREE.Mesh(planeGeometry,new THREE.MeshNormalMaterial());
	scene.add(plane);

	/*
	 var arrowU = new THREE.ArrowHelper( qVector3, pVector3, uVector3.length(), 0x00ff00 );
	 scene.add(arrowU);
	 var arrowV = new THREE.ArrowHelper( rVector3, pVector3, vVector3.length(), 0x00ff00 );
	 scene.add(arrowV);
	 */



	u = q.subtract(p);
	v = r.subtract(p);
	uLengthSq = u.lengthSquared();
	vLengthSq = v.lengthSquared();
	uDotV = u.dotProduct(v);

	projectedParticle = new THREE.Mesh(new THREE.SphereGeometry(0.1,20,20),sphereMaterial);
	// scene.add(projectedParticle);
	var projectedPara = particleProjectToPlaneEquation();
	projectedParticle.pos = planeEquation(projectedPara.s,projectedPara.t);
	positionObject(projectedParticle);

	t0 = new Date().getTime();
	animFrame();
}
function convertV3dToV3(obj){
	var vec3 = new THREE.Vector3(obj.x,obj.y,obj.z);
	return vec3;
}
function convertV3ToV3d(obj){
	var vec3D = new Vector3D(obj.x,obj.y,obj.z);
	return vec3D;
}

function particleProjectToPlaneEquation(){
	var particlePositionMinusP = particle.pos.subtract(p),
		s,
		t,
		result;
	s = (1/((uLengthSq)*(vLengthSq)-Math.pow(uDotV,2)))*(u.multiply(vLengthSq).subtract(v.multiply(uDotV))).dotProduct(particlePositionMinusP);
	t = (1/((uLengthSq)*(vLengthSq)-Math.pow(uDotV,2)))*(u.multiply(-uDotV).add(v.multiply(uLengthSq))).dotProduct(particlePositionMinusP);
	result = {
		s: s,
		t: t
	};
	return result;
}

function planeEquation(s, t){
	return p.add(q.subtract(p).multiply(s)).add(r.subtract(p).multiply(t));
}

function setRandomVector(minX,maxX,minY,maxY,minZ,maxZ){
	return {
		x : getRandomFloat(minX,maxX),
		y : getRandomFloat(minY,maxY),
		z : getRandomFloat(minZ,maxZ)
	};
}
function getRandomFloat(min, max){
	var random = Math.random() * (max - min) + min;
	return parseFloat(random.toFixed(1));
}
function calcForce(pos,vel){
	var gravity = Forces3D.constantGravity(mass,g);
	// var drag = Forces3D.linearDrag(k,vel);
	// force = Forces3D.add([gravity, drag]);
	force = Forces3D.add([gravity]);
}
function getAcc(pos,vel){
	calcForce(pos,vel);
	return force.multiply(1/mass);
}
function EulerExplicit(obj){
	acc = getAcc(obj.pos,obj.velo);
	obj.pos = obj.pos.addScaled(obj.velo,dt);
	obj.velo = obj.velo.addScaled(acc,dt);
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
	// moveObject(ball);
	EulerExplicit(particle);
	var projectedPara = particleProjectToPlaneEquation();
	projectedParticle.pos = planeEquation(projectedPara.s,projectedPara.t);

	if(isCollision(particle,projectedParticle)){
		/*
		 var particlePositionMinusP = convertV3dToV3(particle.pos.subtract(p));
		 var particlePositionBeforeCollision = convertV3dToV3(particle.pos);
		 var particleVelocityBeforeCollision = convertV3dToV3(particle.velo);
		 var normalVelocityBeforeCollision = planeNormalVector.clone().multiplyScalar(particleVelocityBeforeCollision.clone().dot(planeNormalVector));
		 var planeVelocityBeforeCollision = particleVelocityBeforeCollision.clone().sub(normalVelocityBeforeCollision);
		 EulerExplicit(particle);
		 var particlePositionAfterCollision = convertV3dToV3(particle.pos);
		 var veloVec3AfterCollision = normalVelocityBeforeCollision.clone().multiplyScalar(-e).add(planeVelocityBeforeCollision.clone().multiplyScalar(c));
		 particle.velo = convertV3ToV3d(veloVec3AfterCollision);
		 var a = new THREE.Vector3();
		 a.subVectors(particlePositionBeforeCollision,particlePositionAfterCollision);
		 var lamda =  uCrossV.dot(particlePositionMinusP)/uCrossV.dot(a);
		 var posVec3AfterCollision = new THREE.Vector3();
		 posVec3AfterCollision.addVectors(particlePositionBeforeCollision,veloVec3AfterCollision.clone().multiplyScalar((1-lamda)*dt));
		 particle.pos = convertV3ToV3d(posVec3AfterCollision);
		 */
		// console.log(lamda);
	}
	positionObject(particle);
	// positionObject(projectedParticle);
	renderer.render(scene, camera);
}
function positionObject(obj){
	obj.position.set(obj.pos.x,obj.pos.y,obj.pos.z);
}
function isCollision(obj,projectedObj){
	var distanceParticleAndProjection = Vector3D.distance(obj.pos,projectedObj.pos);
	if(distanceParticleAndProjection < radius){
		console.log("collision with infinite plane");
		if(isOnPlaneCollision(obj)){
			return true;
		}else{
			return false;
		}
	}else{
		return false;
	}
}
function isOnPlaneCollision(obj){
	// console.log(obj);
	var particlePositionMinusP = convertV3dToV3(obj.pos.subtract(p)); //b
	var particlePositionBeforeCollision = convertV3dToV3(obj.pos); //x(tn)

	var particleVelocityBeforeCollision = convertV3dToV3(obj.velo);
	var normalVelocityBeforeCollision = planeNormalVector.clone().multiplyScalar(particleVelocityBeforeCollision.clone().dot(planeNormalVector));
	var planeVelocityBeforeCollision = particleVelocityBeforeCollision.clone().sub(normalVelocityBeforeCollision);

	// var objClone = obj.clone();
	// console.log(objClone);
	EulerExplicit(obj);

	var particlePositionAfterCollision = convertV3dToV3(obj.pos);

	var veloVec3AfterCollision = normalVelocityBeforeCollision.clone().multiplyScalar(-e).add(planeVelocityBeforeCollision.clone().multiplyScalar(c));

	var a = new THREE.Vector3();
	a.subVectors(particlePositionBeforeCollision,particlePositionAfterCollision);

	var aCrossB = new THREE.Vector3();
	aCrossB.crossVectors(a, particlePositionMinusP);
	var uCrossVDotA = uCrossV.dot(a);

	var s = aCrossB.dot(vVector3) / uCrossVDotA;
	var t = (-1 * aCrossB.dot(uVector3)) / uCrossVDotA
	var lamda =  uCrossV.dot(particlePositionMinusP)/ uCrossVDotA;

	var posVec3AfterCollision = new THREE.Vector3();
	posVec3AfterCollision.addVectors(particlePositionBeforeCollision,veloVec3AfterCollision.clone().multiplyScalar((1-lamda)*dt));

	if((0 <= s && s <= 1) && (0 <= t && t <= 1) && (0 <= lamda && lamda <= 1)){
		console.log("Collision occur on the Finite Plane");
		obj.velo = convertV3ToV3d(veloVec3AfterCollision);
		obj.pos = convertV3ToV3d(posVec3AfterCollision);
		return true;
	}else{
		return false;
	}


}

