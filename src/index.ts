import * as THREE from 'three';
import { Data } from './model/utils/data';
import { Obstacle } from './model/parts/obstacle';


let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();

let tick = 1;
let meanScore = 0;
let genDuration = 10;
const mapSize = 100;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const element = document.createElement('p')
element.id = 'generation'
element.style.setProperty('position', 'absolute')
element.style.setProperty('top', '0');
element.style.setProperty('left', '0');
element.style.setProperty('color', 'white');
document.body.appendChild(element);

let cube = new THREE.Mesh(new THREE.BoxGeometry(mapSize, mapSize, 1), new THREE.MeshBasicMaterial({ color: 0x222222 }));
cube.position.set(0, 0, -1);

scene.add(cube);


const data = new Data(mapSize);
// for (let i = 0; i < 25; i++) {
//     data.addObstacle(new Obstacle(new THREE.Vector3(Math.cos(Math.random() * Math.PI * 2) * 25, Math.sin(Math.random() * Math.PI * 2) * 25, 0), 3))
// }
const s = 3;

// data.addObstacle(new Obstacle(new THREE.Vector3(s*2, s*2, 0), s));
// data.addObstacle(new Obstacle(new THREE.Vector3(0, s*2, 0), s));
// data.addObstacle(new Obstacle(new THREE.Vector3(-s*2, s*2, 0), s));
// data.addObstacle(new Obstacle(new THREE.Vector3(-s*2, 0, 0), s));
// data.addObstacle(new Obstacle(new THREE.Vector3(s*2, -s*2, 0), s));
// data.addObstacle(new Obstacle(new THREE.Vector3(0, -s*2, 0), s));
// data.addObstacle(new Obstacle(new THREE.Vector3(-s*2, -s*2, 0), s));
// data.addObstacle(new Obstacle(new THREE.Vector3(-s*2, -0, 0), s));


// for (let i = 0; i < 50; i++) {
//     data.addObstacle(new Obstacle(new THREE.Vector3(Math.cos(i) * 40, Math.sin(i) * 40, 0), 4));
// }
data.obstacles.forEach(obstacle => {
    scene.add(obstacle.mesh);
});
data.organisms.forEach(org => {
    scene.add(org.mesh);
    scene.add(org.eyes[0].mesh);
    scene.add(org.eyes[1].mesh);
    scene.add(org.eyes[2].mesh);
    // scene.add(org.eyes[3].mesh);
    // scene.add(org.eyes[4].mesh);
});

data.energyPacks.forEach(energyPack => {
    scene.add(energyPack.mesh);
});


camera.position.z = 200;

setInterval(() => {

}, 10000);


function updateLabel() {

    element.innerText = `Tick: ${tick / 10}\n Organisms: ${data.aliveOrganisms} \n Plankton: ${data.energyPacks.filter(e => e.isActive).length}`
}

function animate() {

    requestAnimationFrame(animate);
    data.updateOrganisms();
    // if (tick % genDuration === 0) {
    //     nextGeneration();
    //     tick = 1;
    // }
    // if (tick < 1000 && tick > 10) {
    //     data.resetEnergy();
    // }


    if (tick % 10 === 0) {
        updateLabel();
        // data.randomSpawn();
    }
    tick++;
    renderer.render(scene, camera);

}




addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowLeft':
            camera.position.x -= 1;
            break;
        case 'ArrowRight':
            camera.position.x += 1;
            break;
        case 'ArrowUp':
            camera.position.y += 1;
            break;
        case 'ArrowDown':
            camera.position.y -= 1;
            break;
        case 'a':
            camera.position.z += 1;
            break;
        case 'z':
            camera.position.z -= 1;
            break;
    }
});

animate();