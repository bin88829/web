var width = window.innerWidth,
	height = window.innerHeight,
	scene, camera, renderer,
	ball,
	plane,
	t0, dt;

window.onload = sceneInit;

function sceneInit(){
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	document.body.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	var angle = 45,
		aspect = width/height,
		near = 0.1,
		far = 10000;
	camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
	camera.position.set(100, 0, 400);
	scene.add(camera);

	var light = new THREE.DirectionalLight();
	light.position.set(-10,0,20);
	scene.add(light);

	var sphereGeometry = new THREE.SphereGeometry(20,20,20);
	var sphereMaterial = new THREE.MeshLambertMaterial({color:0x006666});
	ball = new THREE.Mesh(sphereGeometry,sphereMaterial);
	scene.add(ball);
	ball.pos = new Vector3D(100,0,0);
    ball.velo = new Vector3D(-20,0,-20);
    positionObject(ball);
	
	plane = new THREE.Mesh(new THREE.PlaneGeometry(400,400), new THREE.MeshNormalMaterial());

}

var fixedValue ={
	mass: 1,
	radius: 0.1,
	gravity: new THREE.Vector3(0,0,-10)
};

function initPosition() {
	p = Object.create(randomPosition);
	p.setRandomPosition(-1.5,-1.0,-1.5,-1.0,-0.2,0.2);
	q = Object.create(randomPosition);
	q.setRandomPosition(1.0,1.5,-1.5,-1.0,-0.2,0.2);
	r = Object.create(randomPosition);
	r.setRandomPosition(1.0,-1.5,1.0,1.5,-0.2,0.2);
	particlePosition = Object.create(randomPosition);
	particlePosition.setRandomPosition(-0.2,0.2,-0.2,0.2,2.0,3.0);
	particleVelocity = Object.create(randomPosition);
	particleVelocity.setRandomPosition(-0.1,0.1,-0.1,0.1,-0.1,0.1);

	ball.pos = new Vector3D(particlePosition.x, particlePosition.y, particlePosition.z);
	ball.velo = new Vector3D(particleVelocity.x, particleVelocity.y, particleVelocity.z);
	positionObject(ball);

	plane.position.set();
	scene.add(plane);
}

function positionObject(obj){
	obj.position.set(obj.pos.x,obj.pos.y,obj.pos.z);
}

var randomPosition = {
	x : null,
	y : null,
	z : null,
	setRandomPosition: function(minX,maxX,minY,maxY,minZ,maxZ){
		this.x = this.getRandomFloat(minX,maxX);
		this.y = this.getRandomFloat(minY,maxY);
		this.z = this.getRandomFloat(minZ,maxZ);
	},
	getRandomFloat : function(min, max){
		var random = Math.random() * (max - min) + min;
		return parseFloat(random.toFixed(1));
	}
};

function planeEquation(s, t){
	var result,
		pointX = p.x + s*(q.x - p.x) + t*(r.x - p.x),
		pointY = p.y + s*(q.y - p.y) + t*(r.y - p.y),
		pointZ = p.z + s*(q.z - p.z) + t*(r.z - p.z);
	result = {
		x: pointX,
		y: pointY,
		z: pointZ
	};
	return result;
}

function particleProjectToPlaneEquation(){
	var u = new THREE.Vector3(q.x-p.x,q.y-p.y,q.z-p.z),
		v = new THREE.Vector3(r.x-p.x,r.y-p.y,r.z-p.z),
		uLengthSq = u.lengthSq(),
		vLengthSq = v.lengthSq(),
		uDotV = u.dot(v),
		particlePositionMinusP = new THREE.Vector3(particlePosition.x-p.x,particlePosition.y-p.y,particlePosition.z-p.z),
		s,
		t,
		result;
	s = (1/((uLengthSq)*(vLengthSq)-Math.pow(uDotV,2)))*(u.multiplyScalar(vLengthSq).sub(v.multiplyScalar(uDotV))).dot(particlePositionMinusP);
	t = (1/((uLengthSq)*(vLengthSq)-Math.pow(uDotV,2)))*(u.multiplyScalar(-uDotV).add(v.multiplyScalar(uLengthSq))).dot(particlePositionMinusP);
	result = {
		s: s,
		t: t
	};
	return result;
}

function isCollision(projectedPosition){
	var distanceParticleAndProjection = new THREE.Vector3(particlePosition.x-projectedPosition.x,
					particlePosition.y-projectedPosition.y,
					particlePosition.z-projectedPosition.z).length();
	if(distanceParticleAndProjection < fixedValue.radius){
		return true;
	}else{
		return false;
	}
}






