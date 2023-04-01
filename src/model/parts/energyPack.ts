import * as THREE from "three";
import { Entity, EntityType } from "./entity";

export class EnergyPack extends Entity {
  public isActive: boolean = true;

  constructor() {
    super();
    // geometry should be moved to activate() method
    this.size = 0.3;
    let geometry = new THREE.IcosahedronGeometry(0.1, 2);
    let material = new THREE.MeshBasicMaterial({ color: 0x224422 });
    this.energy = 100;
    this.mesh = new THREE.Mesh(geometry, material);
    this.type = EntityType.EA;
    this.mass = 0.1;
  }

  public deactivate() {
    this.isActive = false;
    this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.mesh.position.set(1000, 1000, 0);
  }

  public activate() {
    this.isActive = true;
    this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x224422 });
  }
}
