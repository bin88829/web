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