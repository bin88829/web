function Forces3(){
}
Forces3.constantGravity = function(m,g){
	return new THREE.Vector3(0,0,m*g);
}
Forces3.add = function(arr){
	var forceSum = new THREE.Vector3(0,0,0);
	for (var i=0; i<arr.length; i++){
		var force = arr[i];
		forceSum.add(force);
	}
	return forceSum;
}
Forces3.spring = function(k,r){
	return r.clone().multiplyScalar(-k);
}		
Forces3.damping = function(c,vel){
	var force;
	var velMag = vel.length();
	if (velMag>0) {
		force = vel.clone().multiplyScalar(-c);
	}
	else {
		force = new THREE.Vector3(0,0,0);
	}
	return force;
}