import { Vector3 } from "three";
import * as THREE from 'three';

export class Eye {
    public position: Vector3;
    public direction1: Vector3;
    public direction2: Vector3;
    public hitObs = false;
    public obstacleDistance = 0;
    public hitEPack = false;
    public energyPackDistance = 0;

    hitMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa22, opacity: 0.0  , transparent: true });
    unhitMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa00, opacity: 0.0  , transparent: true });
    deadMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00aa22, opacity: 0.0, transparent: true });

    public mesh: THREE.Mesh;

    constructor(position: Vector3, direction1: Vector3, direction2: Vector3) {
        this.position = position;
        this.direction1 = direction1;
        this.direction2 = direction2;

        const shape = new THREE.Shape();

        shape.moveTo(position.x, position.y);
        shape.lineTo(direction2.x, direction2.y)
        shape.lineTo(direction1.x, direction1.y)

        const geometry = new THREE.ShapeGeometry(shape);
        this.mesh = new THREE.Mesh(geometry, this.unhitMaterial);
    }

    public hitObstacle(distance: number) {
        this.hitObs = true;
        this.obstacleDistance = distance;
    }

    public unhitObstacle() {
        this.hitObs = false;
        this.obstacleDistance = 0;
    }

    public hitEnergyPack(distance: number) {
        this.hitEPack = true;
        this.energyPackDistance = distance;
        this.mesh.material = this.hitMaterial;
    }

    public unhitEnergyPack() {
        this.hitEPack = false;
        this.mesh.material = this.unhitMaterial;
    }

    public unhit() {
        this.hitObs = false;
        this.hitEPack = false;
        // this.mesh.material = this.unhitMaterial;
    }
}