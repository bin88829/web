function planeToCube(){
	var p1 = new THREE.Vector3(0,0,0),
		p2 = new THREE.Vector3(1,0,0),
		p3 = new THREE.Vector3(1,1,0),
		p4 = new THREE.Vector3(1,1,1),
		p5 = new THREE.Vector3(1,0,1),
		p6 = new THREE.Vector3(0,1,1),
		p7 = new THREE.Vector3(0,1,0),
		p8 = new THREE.Vector3(0,0,1);

	cube = [];

	var plane1 = new PlaneObject();	
	plane1.init(p8,p5,p1);
	cube.push(plane1);
	scene.add(plane1.mesh_obj);

	var plane2 = new PlaneObject();	
	plane2.init(p1,p8,p7);
	cube.push(plane2);
	scene.add(plane2.mesh_obj);

	var plane3 = new PlaneObject();	
	plane3.init(p1,p2,p7);
	cube.push(plane3);
	scene.add(plane3.mesh_obj);

	var plane4 = new PlaneObject();	
	plane4.init(p2,p3,p5);
	cube.push(plane4);
	scene.add(plane4.mesh_obj);

	var plane5 = new PlaneObject();	
	plane5.init(p3,p4,p7);
	cube.push(plane5);
	scene.add(plane5.mesh_obj);

	var plane6 = new PlaneObject();	
	plane6.init(p8,p6,p5);
	cube.push(plane6);
	scene.add(plane6.mesh_obj);
	
}

function ParticleManager(){
	this.particles_array=[];
	this.length = this.particles_array.length;
	this.line;
}
ParticleManager.prototype = {
	addParticle: function(scene, pPosition, pMass, pRadius, pColor){
		// if(this.length !== 0){
		// 	console.log(this.particles_array[this.length - 1].pos);
		// }
		var particleObj = new ParticleObject();
		particleObj.init(pPosition, pMass, pRadius, pColor);
		scene.add(particleObj.mesh_obj);
		this.particles_array.push(particleObj);
		this.length = this.particles_array.length;
	},
	deleteParticle: function(scene){
		if(this.length !== 0 ){
			var last_create_particle = this.particles_array.shift();
			scene.remove(last_create_particle.mesh_obj);
			this.length = this.particles_array.length;	
		}else{
			console.log("There is no particle");
			alert("There is no particle");
		}
	},
	initSpring: function(scene){
		var material = new THREE.LineBasicMaterial({
			color: 0x0000ff
		});

		var geometry = new THREE.Geometry();

		for(var i = 0; i<this.particles_array.length; i++){
			geometry.vertices.push(
				this.particles_array[i].pos
			);
		}

		this.line = new THREE.Line( geometry, material );
		scene.add( this.line );
	},
	updateSpring: function(){
		for(var i = 0; i<this.particles_array.length; i++){
			this.line.geometry.vertices[i] = this.particles_array[i].pos;
		}
		this.line.geometry.verticesNeedUpdate = true;
	}
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

	init: function(pP,qP,rP){
		// this.p = setRandomVector3(-1.5,-1.0,-1.5,-1.0,-0.2,0.2);
		// this.q = setRandomVector3(1.0,1.5,-1.5,-1.0,-0.2,0.2);
		// this.r = setRandomVector3(1.0,-1.5,1.0,1.5,-0.2,0.2);
		// this.p = new THREE.Vector3(0,0,1);
		// this.q = new THREE.Vector3(0,1,1);
		// this.r = new THREE.Vector3(1,0,1);
		this.p = pP;
		this.q = qP;
		this.r = rP;

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
	 
	    this.mesh_obj = new THREE.Mesh(planeGeometry,new THREE.MeshBasicMaterial({
	    	map: THREE.ImageUtils.loadTexture('images/plywood.jpg'),
	    	side: THREE.DoubleSide,
	    	transparent: true, 
	    	opacity: 0.3
	    }));
	    //MeshNormalMaterial

	},
	planeEquation: function(s,t){
		var result;
		result = this.p.clone().add(this.u.clone().multiplyScalar(s)).add(this.v.clone().multiplyScalar(t));
		return result;
	}
};

function ParticleObject(){
	this.mesh_obj;
	this.pos;
	this.velo;
	this.r;
	this.c;
	this.m;
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
	init: function(pP, m, r, c){ /*r, c mass optional*/ 
		if (r === undefined) r = radius;
		if (c === undefined) c = particle_color;
		if (m === undefined) m = mass;
		this.r = r;
		this.c = c;
		this.m = m; 
		var sphereGeometry = new THREE.SphereGeometry(this.r,20,20);
		var sphereMaterial = new THREE.MeshLambertMaterial({ color: this.c });
		this.mesh_obj = new THREE.Mesh(sphereGeometry,sphereMaterial);

		//set Initial Random Position
		// var init_position_vec3 = setRandomVector3(-0.2,0.2,-0.2,0.2,2.0,3.0);
		var init_position_vec3 = pP;
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