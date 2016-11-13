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

    // pManager = new ParticleManager();
    // pManager.initSpring(scene);

    ropeManager = [];
    ropeManager.push(ropeMaker(new THREE.Vector3(10,10,20), 30));
    ropeManager.push(ropeMaker(new THREE.Vector3(9.95,9.95,19.5), 30));

    // entire_particles_in_rope = rope_manager[0].particles_array.concat(rope_manager[1].particles_array);


    planeToCube();

    // createRope();

	showAixs();

	t0 = new Date().getTime();

	animFrame();
	initEvent();
}

function ropeMaker(first_particle_pos_vec, particle_num){
    var pm = new ParticleManager();
    pm.initSpring(scene);
    pm.addParticle(scene, first_particle_pos_vec.clone().add(new THREE.Vector3(0, 0, 1)), 1, 0.05, 0x0000FF);
    for(var i =1; i<particle_num; i++){
        pm.addParticle(scene, first_particle_pos_vec.clone().sub(new THREE.Vector3(0, 0, 0.15*i)), 1, 0.05, 0x0000FF);
    }
    return pm;
}

function createRope(){
    pManager.addParticle(scene, new THREE.Vector3(10,10,21), 1, 0.05, 0x0000FF);
    for(var i =1; i<30; i++){
        pManager.addParticle(scene, new THREE.Vector3(10, 10, 20-(0.15*i)), 1, 0.05, 0x0000FF);
    }
}

function setInitValue(){
    g = -10;
    mass = 1;
    k = 0.1;
    e = 1;
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
    // var t1 = new Date().getTime();
    // dt = 0.00005*(t1-t0);
    // t0 = t1;
    dt = 0.005;
    if (dt>0.2) {dt=0;};

    move();
}

function move(){

    moveLogic(ropeManager);
    controls.update();
    camera.lookAt( new THREE.Vector3(10,10,20) );
    renderer.render(scene, camera);
}

function moveLogic(rope_manager){

    for(var j=0; j<rope_manager.length; j++){
        var particles_array = rope_manager[j].particles_array;
        var b;
        var pre;
        for(var i=0; i<particles_array.length; i++){
            if( i == particles_array.length-1 ){
                // Last One
                b = pre.multiplyScalar(-1);
            }else{
                var sForce = springForce(particles_array[i],particles_array[i+1]).multiplyScalar( dt / particles_array[i].m ).clone();
                var gv = implicitGV(particles_array[i],particles_array[i+1]).multiplyScalar( dt * dt / particles_array[i].m ).clone();
                if(i == 0){
                    // First one
                    pre = sForce.add(gv);
                    b = pre;
                }else{
                    current = sForce.add(gv);
                    b = current.clone().sub(pre);
                    pre = current;
                }
            }
            var pre_velo = particles_array[i].velo.clone();
            var pre_pos = particles_array[i].pos.clone();

            var velo = particles_array[i].velo.add(b).add(Forces3.constantGravity(particles_array[i].m, g).multiplyScalar(dt));
            particles_array[i].pos.add(velo.clone().multiplyScalar(dt));

            CollisionHandler.collisionPlanes(pre_pos, pre_velo, particles_array[i], cube);
            // CollisionHandler.collisionInRope(i, particles_array);
            CollisionHandler.collisionBetweenParticles(i, particles_array);

            if(j==0){
                for(var k=0;k<rope_manager[1].particles_array.length; k++){
                    CollisionHandler.collisionTwoParticles(particles_array[i], rope_manager[1].particles_array[k]);
                }
            }

            particles_array[i].moveObject();
        }
        rope_manager[j].updateSpring(scene);
    }
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

    // camera.position.set(0,-2.5,4);
    camera.position.set(10,5,30);

	// camera.up = new THREE.Vector3(10,10,0);
	scene.add(camera);

	var light = new THREE.DirectionalLight();
	light.position.set(-10,0,20);
	scene.add(light);

	controls = new THREE.OrbitControls(camera, renderer.domElement);

}