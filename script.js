import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight,0.1,1000);

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth,window.innerHeight)
document.body.appendChild(renderer.domElement)
camera.position.z = 5

const controls = new OrbitControls(camera, renderer.domElement)

const geomtryl = new THREE.BoxGeometry(1,2,4);
const material1 = new THREE.MeshLambertMaterial({color: 0xffffff})
const cube = new THREE.Mesh(geomtryl,material1)
scene.add(cube); 

const geomtry2 = new THREE.BoxGeometry(1,2,4);
const material2 = new THREE.MeshLambertMaterial({color: 0xffffff})
const cube1 = new THREE.Mesh(geomtry2,material2)
scene.add(cube1);

const light = new THREE.PointLight(0xffffff, 100);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight);
cube.position.x = 4;
cube1.position.x = -4;
function animate(){
requestAnimationFrame(animate);

cube.rotation.x += 0.009
cube.rotation.y += 0.01
cube1.rotation.x +=0.01
cube1.rotation.y +=0.01
renderer.render(scene,camera);

}
animate();

