import * as THREE from "three";
import { Entity, EntityType } from "./entity";

export class Obstacle extends Entity {
  constructor(size: number) {
    super();
    // geometry should be moved to activate() method
    this.size = size;
    let geometry = new THREE.IcosahedronGeometry(this.size, 2);
    let material = new THREE.MeshBasicMaterial({ color: 0x222222 });
    this.energy = 100;
    this.mesh = new THREE.Mesh(geometry, material);
    this.type = EntityType.ROCK;
    this.mass = 1000;
  }
}
