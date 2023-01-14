import * as THREE from "three";

export class Obstacle {
  public mesh: THREE.Mesh;
  public position: THREE.Vector3;
  public size: number;
  public color: THREE.Color;

  constructor(position: THREE.Vector3, size: number) {
    this.position = position;
    this.size = size;
    let geometry = new THREE.IcosahedronGeometry(size, 2);
    let material = new THREE.MeshBasicMaterial({
      color: 0x002222,
      transparent: true,
      opacity: 0.5,
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);
  }
}
