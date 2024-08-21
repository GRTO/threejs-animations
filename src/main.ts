import './style.css';
import GUI from 'lil-gui';
import {
	BoxGeometry,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	PointLight,
	Raycaster,
	Scene,
	SphereGeometry,
	Vector2,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

type MeshId = "cube" | "plane" | "sphere";

const colorsMap: Record<MeshId, number> = {
	cube: 0x2af4f2,
	sphere: 0x1a14f2,
	plane: 0xffffff,
}

const createCube = () => {
	const cubeGeometry = new BoxGeometry();
	const cubeMaterial = new MeshStandardMaterial({ color: colorsMap.cube });
	const cube = new Mesh(cubeGeometry, cubeMaterial);
	cube.castShadow = true;
	cube.name = "cube";
	return cube;
}

const createSphere = () => {
	const sphereGeometry = new SphereGeometry();
	const sphereMaterial = new MeshStandardMaterial({ color: colorsMap.sphere });
	const sphere = new Mesh(sphereGeometry, sphereMaterial);
	sphere.castShadow = true;
	sphere.position.x += 2;
	sphere.name = "sphere";
	return sphere;
}

const createPlane = () => {
	const planeGeometry = new PlaneGeometry(15, 15);
	const planeMaterial = new MeshStandardMaterial({ color: colorsMap.plane });
	const plane = new Mesh(planeGeometry, planeMaterial);
	plane.rotation.x = - Math.PI / 2;
	plane.position.y = -1.5;
	plane.receiveShadow = true;
	plane.name = "plane";
	return plane;
}

const createLight = () => {
	const light = new PointLight(0xffffff, 100, 100);
	light.position.set(5, 5, 5);
	
	light.castShadow = true;
	light.name = "pointLight";
	return light;
}

// ----------------------------------------------------------------------------
const gui = new GUI();
const scene = new Scene();

let lastIntersectedObject: MeshId | null = null;

const state = {
    cubeRotationSpeed: 0.01,
	sphereRotationSpeed: 0.03,
    sphereRotationRadius: 3,
	enabledRayCasting: false,
};

gui.add(state, 'cubeRotationSpeed', 0, 0.1).name("Cube Speed Rotation");
gui.add(state, 'sphereRotationSpeed', 0, 0.1).name("Sphere Speed Rotation");
gui.add(state, 'sphereRotationRadius', 2, 5).name("Sphere Radius Rotation");
gui.add(state, 'enabledRayCasting').name("Enable raycasting");

window.addEventListener('pointermove', (event) => {
	if (state.enabledRayCasting) {
		const mouse = new Vector2();
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
		
		const raycaster = new Raycaster();
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObjects(scene.children);
		
		if (intersects.length > 0) {
			const [firstIntersect, ...nextIntersects] = intersects;
			const intersectedObject = firstIntersect.object;
	
			if (intersectedObject instanceof Mesh) {
				if (lastIntersectedObject !== intersectedObject.name) {
					lastIntersectedObject = intersectedObject.name as MeshId;
					intersectedObject.material.color.set(0xff0000);
				}
			}
	
			nextIntersects?.forEach(({ object }) => {
				const mesh = object as Mesh<any, any>;
				const meshId = mesh.name as MeshId;
				mesh.material.color.set(colorsMap[meshId]);
			});
		} else if (lastIntersectedObject) {
			const intersectedMesh = scene.getObjectByName(lastIntersectedObject) as Mesh<any, any>;
			intersectedMesh.material.color.set(colorsMap[lastIntersectedObject]);
	
			lastIntersectedObject = null;
		}
	}
});


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

const plane = createPlane();
scene.add(plane);


const light = createLight();
scene.add(light);

let delta = 0.1;

// Camera orbits
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

function animate() {
    requestAnimationFrame(animate);
	controls.update();

    // Rotate the cube
    cube.rotation.x += state.cubeRotationSpeed;
    cube.rotation.y += state.cubeRotationSpeed;

	sphere.position.z = state.sphereRotationRadius * Math.sin(delta);
	sphere.position.x = state.sphereRotationRadius * Math.cos(delta);
	delta+=state.sphereRotationSpeed;

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

