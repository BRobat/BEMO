import * as THREE from "three";
import { Data } from "./model/utils/data";
import { Obstacle } from "./model/parts/obstacle";
import { Organism } from "./model/parts/organism";

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let chosenOrg = 0;

let renderer = new THREE.WebGLRenderer();

let tick = 1;
let meanScore = 0;
let genDuration = 10;
const mapSize = 150;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const element = document.createElement("p");
element.id = "generation";
element.style.setProperty("position", "absolute");
element.style.setProperty("top", "0");
element.style.setProperty("left", "0");
element.style.setProperty("color", "white");
element.style.setProperty("background-color", "rgba(0,0,0,0.5)");
document.body.appendChild(element);

let cube = new THREE.Mesh(
  new THREE.BoxGeometry(mapSize, mapSize, 1),
  new THREE.MeshBasicMaterial({ color: 0x111111 })
);
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
data.obstacles.forEach((obstacle) => {
  scene.add(obstacle.mesh);
});
data.organisms.forEach((org) => {
  scene.add(org.mesh);
  // scene.add(org.eyes[3].mesh);
  // scene.add(org.eyes[4].mesh);
});

data.energyPacks.forEach((energyPack) => {
  scene.add(energyPack.mesh);
});

camera.position.z = 200;

// setInterval(() => {}, 10000);

function updateLabel() {
  let energy = 0;
  data.entities.forEach((entity) => {
    energy += entity.energy;
  });

  element.innerText = `Tick: ${tick / 10}\n Organisms: ${
    data.aliveOrganisms
  } \n Dead matter: ${
    data.energyPacks.filter((e) => e.isActive).length
  }\n Total energy: ${Math.floor(energy)}
  \n 
  ${data.organisms[chosenOrg].name}
  Time alive: ${Math.floor(data.organisms[chosenOrg].timeAlive / 10)}
 HP: ${Math.round(data.organisms[chosenOrg].hp)} / ${Math.round(
    data.organisms[chosenOrg].attributes.maxHP
  )}
 energy: ${Math.round(data.organisms[chosenOrg].energy)} / ${Math.round(
    data.organisms[chosenOrg].attributes.maxEnergy
  )}
 speed: ${
   Math.round(
     data.organisms[chosenOrg].speed.distanceTo(new THREE.Vector3(0, 0, 0)) *
       100
   ) / 100
 }
 attackStrength: ${Math.round(data.organisms[chosenOrg].attributes.attack)}
  defense: ${Math.round(data.organisms[chosenOrg].attributes.defense)}
  isAggresive: ${data.organisms[chosenOrg].isAggresive}
  sight: ${Math.round(data.organisms[chosenOrg].attributes.eyeSight)}

 
  right: ${
    Math.round(data.organisms[chosenOrg].brain.outputs[0].value * 100) / 100
  }
  left: ${
    Math.round(data.organisms[chosenOrg].brain.outputs[1].value * 100) / 100
  }
  accel: ${
    Math.round(data.organisms[chosenOrg].brain.outputs[2].value * 100) / 100
  }
  aggresive: ${
    Math.round(data.organisms[chosenOrg].brain.outputs[3].value * 100) / 100
  }


  
  `;

  // eye1negative: ${data.organisms[chosenOrg].brain.inputs[0]}
  // eye1positive: ${data.organisms[chosenOrg].brain.inputs[1]}
  // eye1free: ${data.organisms[chosenOrg].brain.inputs[2]}
  // eye2negative: ${data.organisms[chosenOrg].brain.inputs[3]}
  // eye2positive: ${data.organisms[chosenOrg].brain.inputs[4]}
  // eye2free: ${data.organisms[chosenOrg].brain.inputs[5]}
  // eye3negative: ${data.organisms[chosenOrg].brain.inputs[6]}
  // eye3positive: ${data.organisms[chosenOrg].brain.inputs[7]}
  // eye3free: ${data.organisms[chosenOrg].brain.inputs[8]}
  // eye4negative: ${data.organisms[chosenOrg].brain.inputs[9]}
  // eye4positive: ${data.organisms[chosenOrg].brain.inputs[10]}
  // eye4free: ${data.organisms[chosenOrg].brain.inputs[11]}

  // neuron1: ${data.organisms[chosenOrg].brain.hidden[0].value}
  // neuron2: ${data.organisms[chosenOrg].brain.hidden[1].value}
  // neuron3: ${data.organisms[chosenOrg].brain.hidden[2].value}
  // neuron4: ${data.organisms[chosenOrg].brain.hidden[3].value}
  // neuron5: ${data.organisms[chosenOrg].brain.hidden[4].value}
  // neuron6: ${data.organisms[chosenOrg].brain.hidden[5].value}
  // neuron7: ${data.organisms[chosenOrg].brain.hidden[6].value}
  // neuron8: ${data.organisms[chosenOrg].brain.hidden[7].value}
  // neuron9: ${data.organisms[chosenOrg].brain.hidden[8].value}
  // neuron10: ${data.organisms[chosenOrg].brain.hidden[9].value}
  // neuron11: ${data.organisms[chosenOrg].brain.hidden[10].value}
  // neuron12: ${data.organisms[chosenOrg].brain.hidden[11].value}
  // neuron13: ${data.organisms[chosenOrg].brain.hidden[12].value}
  // neuron14: ${data.organisms[chosenOrg].brain.hidden[13].value}
}

function animate() {
  requestAnimationFrame(animate);
  data.updateOrganisms();
  camera.position.x = data.organisms[chosenOrg].mesh.position.x;
  camera.position.y = data.organisms[chosenOrg].mesh.position.y;

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

addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
      camera.position.x -= 5;
      break;
    case "ArrowRight":
      camera.position.x += 5;
      break;
    case "ArrowUp":
      camera.position.y += 5;
      chosenOrg += 1;
      break;
    case "ArrowDown":
      camera.position.y -= 5;
      chosenOrg -= 1;
      break;
    case "a":
      camera.position.z += 10;
      break;
    case "z":
      camera.position.z -= 10;
      break;
  }
});

animate();
