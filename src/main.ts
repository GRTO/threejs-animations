import './style.css'
import {
	BoxGeometry,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	Scene,
	SphereGeometry,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const createCube = () => {
	const cubeGeometry = new BoxGeometry();
	const cubeMaterial = new MeshStandardMaterial({ color: 0x2af4f2 });
	const cube = new Mesh(cubeGeometry, cubeMaterial);
	cube.castShadow = true;
	return cube;
}

const createSphere = () => {
	const sphereGeometry = new SphereGeometry();
	const sphereMaterial = new MeshStandardMaterial({ color: 0x1a14f2 });
	const sphere = new Mesh(sphereGeometry, sphereMaterial);
	sphere.castShadow = true;
	sphere.position.x += 2;
	return sphere;
}

const createPlace = () => {
	const planeGeometry = new PlaneGeometry(5, 5);
	const planeMaterial = new MeshStandardMaterial({ color: 0xffffff });
	const plane = new Mesh(planeGeometry, planeMaterial);
	plane.rotation.x = - Math.PI / 2;
	plane.position.y = -1.5;
	plane.receiveShadow = true;
	return plane;
}

const createLight = () => {
	const light = new PointLight(0xffffff, 100, 100);
	light.position.set(5, 5, 5);
	
	light.castShadow = true;
	return light;
}

// ----------------------------------------------------------------------------

const scene = new Scene();

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const cube = createCube();
scene.add(cube);

const sphere = createSphere();
scene.add(sphere);

const plane = createPlace();
scene.add(plane);


const light = createLight();
scene.add(light);

let rotationSpeed = 0.01;
let delta = 0.1;

// Camera orbits
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function animate() {
    requestAnimationFrame(animate);
	controls.update();

    // Rotate the cube
    cube.rotation.x += rotationSpeed;
    cube.rotation.y += rotationSpeed;

	sphere.position.z = 3 * Math.sin(delta);
	sphere.position.x = 3 * Math.cos(delta);
	delta+=0.03;

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);
}

animate();

// Resize event listener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

