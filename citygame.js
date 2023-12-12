import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const objects = []; //list ~ array
let raycasterList = []; //raygun
let centerRay; 
let directionXList = [-0.4,-0.4,0.4,0.4,-0.4,0.4,0,0]
let directionZList = [-0.4,0.4,-0.4,0.4,0,0,-0.4,0.4]//need fix? 

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let isSprinting = false; 
let isCrouching = false; 

let prevTime = performance.now(); //current time
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let loader = new GLTFLoader();

let camera, scene, controls, renderer;

init();
animate();
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.y = -1,1,0;

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    instructions.addEventListener('click', function () {
        controls.lock();
    });
    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });
    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    });

    scene.add(controls.getObject());

    const onKeyDown = function (event) {
        switch (event.code) {
            case 'KeyW':
                moveForward = true;
                break;
            case 'KeyA':
                moveLeft = true;
                break;
            case 'KeyS':
                moveBackward = true;
                break;
            case 'KeyD':
                moveRight = true;
                break;
            case 'Space':
                if (canJump === true) velocity.y += 30; //jump force
                canJump = false;
                break;
            case 'ShiftLeft':
                isSprinting = true; 
                break;
            case 'KeyC':
                if(isCrouching != true) camera.position.y -= 0.4;  
                isCrouching = true; 
                break; 
        }
    }

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'KeyW':
                moveForward = false;
                break;
            case 'KeyA':
                moveLeft = false;
                break;
            case 'KeyS':
                moveBackward = false;
                break;
            case 'KeyD':
                moveRight = false;
                break;
            case 'ShiftLeft':
                isSprinting = false; 
                break;
            case 'KeyC':
                camera.position.y += 0.4; 
                isCrouching = false; 
                break;
        }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    for(let i = 0; i<8; i++){
        let raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0), 0, 1); //1 corresponds to height of player
        raycasterList.push(raycaster); 
    }
    centerRay = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0,-1,0),0,1);

    const light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
    
loader.load('./aaroncity.glb',function(gtlf){
    let city = gtlf.scene; //load city
    scene.add(city);//add city to scene
    city.traverse(function(glb){
        objects.push(glb); //add city objects to collision list
    });
});

    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(window.devicePixelRatio); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix(); 

    renderer.setSize(window.innerWidth, window.innerHeight); 
}

function animate() {
    requestAnimationFrame(animate);

    const time = performance.now(); 

    if(controls.isLocked === true){

        //Corner Rays (8)
        for(let i =0; i<8; i++){
            raycasterList[i].ray.origin.copy(controls.getObject().position);
            raycasterList[i].ray.origin.set(
                raycasterList[i].ray.origin.x + directionXList[i],
                raycasterList[i].ray.origin.y - 1,
                raycasterList[i].ray.origin.z + directionZList[i]
                );
        }
        //Center Ray
        centerRay.ray.origin.copy(controls.getObject().position);
        centerRay.ray.origin.y -= 1
        //Intersections
        const intersections = []; 
        intersections.push(centerRay.intersectObjects(objects,false)) //center
        raycasterList.forEach(raycaster => {
            intersections.push(raycaster.intersectObjects(objects,false)); //corners
        });
        let onObject = false; 
        intersections.forEach(list => {
            let tester = list.length > 0; 
            if(tester)
                onObject = true; 
        });
        //Change in Time Calculation
        const delta = (time - prevTime) / 1000; 
        //Change in Velocity over time (Acceleration)
        velocity.x -= velocity.x * 10.0 * delta; //10.0 is speed
        velocity.z -= velocity.z * 10.0 * delta; //10.0 is speed
        velocity.y -= 9.8 * 10.0 * delta; //10.0 is mass
        //Direction of Velocity Calculation
        direction.z = Number(moveForward) - Number(moveBackward); 
        direction.x = Number(moveRight) - Number(moveLeft); 
        direction.normalize(); 

        if(isSprinting){
            camera.fov = 80;
            camera.updateProjectionMatrix();
            if(moveForward||moveBackward) velocity.z -= direction.z * 100.0 * delta; 
            if(moveLeft||moveRight) velocity.x -= direction.x * 100.0 * delta; 
        }else if(isCrouching){
            camera.fov = 70;
            camera.updateProjectionMatrix();
            if(moveForward||moveBackward) velocity.z -= direction.z * 25.0 * delta; 
            if(moveLeft||moveRight) velocity.x -= direction.x * 25.0 * delta; 
        }else{
            camera.fov = 75;
            camera.updateProjectionMatrix();
            if(moveForward||moveBackward) velocity.z -= direction.z * 50.0 * delta; 
            if(moveLeft||moveRight) velocity.x -= direction.x * 50.0 * delta; 
        }
        //Negative Vertical Collisions
        if(onObject === true){
            velocity.y = Math.max(0,velocity.y); 
            canJump = true; 
        }

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta);
        
        if(controls.getObject().position.y < -20){
            velocity.y = 0; 
            controls.getObject().position.set(0,10.1,0); //respawn 

            canJump = true; 
        }
    }
    prevTime = time; 

    renderer.render(scene, camera);
}