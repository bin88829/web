function CollisionHandler(){

}
CollisionHandler.collisionBetweenParticleAndPlane = function(particleObj, planeObj){
	var particlePositionMinusP = particleObj.pos.clone().sub(planeObj.p); //b
	var particlePositionBeforeCollision = particleObj.pos.clone(); //x(tn)
	
	var particleVelocityBeforeCollision = particleObj.velo.clone();
	var normalVelocityBeforeCollision = planeObj.normal_vector.clone().multiplyScalar(particleVelocityBeforeCollision.dot(planeObj.normal_vector));
	var planeVelocityBeforeCollision = particleVelocityBeforeCollision.clone().sub(normalVelocityBeforeCollision);

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

CollisionHandler.collisionBetweenParticles = function(i, particles_array){
	for (var j = i + 1 ; j < particles_array.length; j++) {
		CollisionHandler.collisionTwoParticles(particles_array[i], particles_array[j]);
	};
	/*
	// input para: particleManager
	for (var i = 0; i < particleManager.length; i++) {
		for (var j = i + 1 ; j < particleManager.length; j++) {
			CollisionHandler.collisionTwoParticles(particleManager.particles_array[i], particleManager.particles_array[j]);
		};		
	};
	*/
}

CollisionHandler.collisionTwoParticles = function (particleB, particleA){
	var distance = new THREE.Vector3();
	distance.subVectors(particleB.pos, particleA.pos);
	var z = distance.length() - (particleB.r + particleA.r);
	
	if(z < 0){
		var n = distance.clone().normalize();
		
		var uBeforeCollision = particleB.velo.clone().sub(particleA.velo).dot(n);
		
		var j = (1+e) * ((particleA.m * particleB.m)/( particleA.m + particleB.m )) * uBeforeCollision;

		particleA.velo.add(n.clone().multiplyScalar(j/particleA.m));

		particleB.velo.sub(n.clone().multiplyScalar(j/particleB.m));

		// console.log("Collision occurs between particles");

	}else{
		
	}
}

/*
CollisionHandler.collisionTwoParticles = function (particleB, particleA){
	var distance = new THREE.Vector3();
	distance.subVectors(particleB.pos, particleA.pos);
	var z = distance.length() - (2 * radius);
	
	if(z < 0){
		var n = distance.clone().normalize();
		
		var uBeforeCollision = particleB.velo.clone().sub(particleA.velo).dot(n);
		
		var j = (1+e) * ((mass* mass)/( mass + mass )) * uBeforeCollision;

		particleA.velo.add(n.clone().multiplyScalar(j/mass));

		particleB.velo.sub(n.clone().multiplyScalar(j/mass));

		// console.log("Collision occurs between particles");

	}else{
		
	}
}
*/

function EulerExplicit(obj){			
	// acc = getAcc(obj.pos.clone(),obj.velo.clone());
	acc = getAcc(obj); 
	obj.pos=obj.pos.add(obj.velo.clone().multiplyScalar(dt));
	obj.velo=obj.velo.add(acc.clone().multiplyScalar(dt));		
}
function getAcc(obj){
	calcForce(obj);
	return force.multiplyScalar(1/obj.m);
}
// function getAcc(pos,vel){
// 	calcForce(pos,vel);
// 	return force.multiplyScalar(1/mass);
// }
function calcForce(obj){
	var gravity = Forces3.constantGravity(obj.m,g);
	// var drag = Forces3D.linearDrag(k,vel);
	// force = Forces3D.add([gravity, drag]);
	force = Forces3.add([gravity]);		
}
// function calcForce(pos,vel){
// 	var gravity = Forces3.constantGravity(mass,g);
// 	// var drag = Forces3D.linearDrag(k,vel);
// 	// force = Forces3D.add([gravity, drag]);
// 	force = Forces3.add([gravity]);		
// }