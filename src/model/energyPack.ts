import * as THREE from 'three';

export class EnergyPack {
    public mesh: THREE.Mesh;
    public isActive: boolean = true;

    public energy = 200;

    constructor() {
        let geometry = new THREE.IcosahedronGeometry(0.1, 2);
        let material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
    }

    public deactivate() {
        this.isActive = false;
        this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.mesh.position.set(100, 100, 0);
    }

    public activate() {
        this.isActive = true;
        this.mesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    }
}