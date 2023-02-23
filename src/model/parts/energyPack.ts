import * as THREE from "three";
import { Entity } from "./entity";

export class EnergyPack extends Entity {
  public isActive: boolean = true;

  constructor() {
    super();
    // geometry should be moved to activate() method
    let geometry = new THREE.IcosahedronGeometry(0.1, 2);
    let material = new THREE.MeshBasicMaterial({ color: 0x222222 });
    this.energy = 1000;
    this.mesh = new THREE.Mesh(geometry, material);
  }

  public deactivate() {
    this.isActive = false;
    this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.mesh.position.set(1000, 1000, 0);
  }

  public activate() {
    this.isActive = true;
    this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x222222 });
  }
}
