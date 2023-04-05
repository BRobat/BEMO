import * as THREE from "three";
import { Data } from "./model/utils/data";
import { Organism } from "./model/parts/organism";
import { OrbitControls } from "@three-ts/orbit-controls";
import { Entity } from "./model/parts/entity";

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let chosenOrg = 0;

let renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});

let selectrionRing = new THREE.Mesh(
  new THREE.RingGeometry(0.55, 0.6, 32),
  new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide,

    opacity: 0.5,
  })
);

let raycaster = new THREE.Raycaster();

let tick = 1;
let meanScore = 0;
let genDuration = 10;
const mapSize = 150;

let followSelected = false;

renderer.setSize(document.body.clientWidth, document.body.clientHeight);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = (Math.PI * 10) / 11;
controls.minAzimuthAngle = 0;
controls.maxAzimuthAngle = 0;

controls.center.set(0, 0, 0);

// How far you can dolly in and out ( PerspectiveCamera only )
controls.minDistance = 0;
controls.maxDistance = 100000;

const enableZoom = true; // Set to false to disable zooming
const zoomSpeed = 1.0;

controls.enablePan = true; // Set to false to disable panning (ie vertical and horizontal translations)

controls.enableDamping = false; // Set to false to disable damping (ie inertia)
controls.dampingFactor = 0.25;

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
  new THREE.MeshBasicMaterial({ color: 0x334455 })
);
cube.position.set(0, 0, -0.5);

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

scene.add(selectrionRing);

camera.position.z = 200;

// setInterval(() => {}, 10000);

function updateLabel() {
  let energy = 0;
  data.entities.forEach((entity) => {
    if (entity instanceof Organism && !entity.isDead) {
      energy += entity.energy;
    }
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
    Type: ${data.organisms[chosenOrg].type}
    sight: ${Math.round(data.organisms[chosenOrg].attributes.eyeSight)}
    `;

  //   right: ${Math.round(data.organisms[chosenOrg].brain.outputs[0].value * 100) / 100
  //     }
  //   left: ${Math.round(data.organisms[chosenOrg].brain.outputs[1].value * 100) / 100
  //     }
  //   accel: ${Math.round(data.organisms[chosenOrg].brain.outputs[2].value * 100) / 100
  //     }

  //   eye1negative: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[0]) / 100
  //     }
  //   eye1positive: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[1]) / 100
  //     }
  //   eye1neutral: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[2]) / 100
  //     }
  //   eye2negative: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[3]) / 100
  //     }
  //   eye2positive: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[4]) / 100
  //     }
  //   eye2neutral: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[5]) / 100
  //     }
  //   eye3negative: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[6]) / 100
  //     }
  //   eye3positive: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[7]) / 100
  //     }
  //   eye3neutral: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[8]) / 100
  //     }
  //   eye4negative: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[9]) / 100
  //     }
  //   eye4positive: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[10]) / 100
  //     }
  //   eye4neutral: ${Math.floor(100 * data.organisms[chosenOrg].brain.inputs[11]) / 100
  //     }

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
  if (followSelected) {
    camera.position.y = data.organisms[chosenOrg].mesh.position.y - 10;
    camera.position.x = data.organisms[chosenOrg].mesh.position.x;
    selectrionRing.position.x = data.organisms[chosenOrg].mesh.position.x;
    selectrionRing.position.y = data.organisms[chosenOrg].mesh.position.y;
    selectrionRing.position.z = data.organisms[chosenOrg].mesh.position.z + 0.1;
    controls.target = data.organisms[chosenOrg].mesh.position;
  } else {
  }
  // camera.lookAt(data.organisms[chosenOrg].mesh.position);

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
      // chosenOrg += 1;
      break;
    case "ArrowDown":
      camera.position.y -= 5;
      // chosenOrg -= 1;
      break;
    case "a":
      camera.position.z += 3;
      break;
    case "z":
      camera.position.z -= 3;
      break;
    case "s":
      console.log(JSON.stringify(data.organisms[chosenOrg]));
      break;
    case "q":
      controls.enablePan = followSelected;
      followSelected = !followSelected;
      if (!followSelected) {
        controls.target = data.organisms[chosenOrg].mesh.position.clone();
        selectrionRing.position.x = 100000;
        selectrionRing.position.y = 100000;
      }
      break;
    case "w":
      data.organisms[chosenOrg].energy += 50;
      break;
    case "e":
      data.organisms[chosenOrg].kill("killed by users");
      break;
  }
});

renderer.domElement.addEventListener("click", (event) => {
  var mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Cast a ray from the camera to the mouse position
  raycaster.setFromCamera(mouse, camera);

  // Find all intersected objects
  var intersects = raycaster.intersectObjects(scene.children, true);

  // If an object was clicked, do something
  if (intersects.length > 0) {
    intersects.find((intersection) => {
      if (!data) {
        return;
      }
      data.organisms.find((entity: Entity, i) => {
        if (entity.mesh.uuid === intersection.object.uuid) {
          chosenOrg = i;
          controls.enablePan = false;
          followSelected = true;
        }
      });
    });
  }
});
animate();
