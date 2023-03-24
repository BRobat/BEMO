import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Genome } from "../parts/genome";
import { EntityType } from "../parts/entity";
import { BufferGeometry } from "three";

export class Appearance {
  static createAppearance(
    genome: Genome,
    type: string,
    mesh: THREE.Mesh,
    geometry: THREE.BufferGeometry,
    material: THREE.MeshBasicMaterial
  ): void {
    switch (type) {
      case EntityType.A:
        this.appearanceA(genome, mesh, geometry, material);
        break;
      case EntityType.B:
        // this.appearanceB(genome, mesh, geometry, material);
        break;
      case EntityType.C:
        // this.appearanceC(genome, mesh, geometry, material);
        break;
      case EntityType.D:
        // this.appearanceD(genome, mesh, geometry, material);
        break;
    }
  }

  static appearanceA(
    genome: Genome,
    mesh: THREE.Mesh,
    geometry: BufferGeometry,
    material: THREE.MeshBasicMaterial
  ): void {
    if (!geometry) {
      geometry = new THREE.BufferGeometry();
    }
    geometry = new THREE.IcosahedronGeometry(
      genome.words[9] * genome.words[6] * 0.3 + 0.1,
      2
    );
    material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        `rgb(${Math.floor(genome.words[6] * 100)}, ${
          Math.floor(genome.words[7] * 100) + 150
        }, ${Math.floor(genome.words[4] * 100)})`
      ),
    });
    if (mesh) {
      mesh.geometry = geometry;
      mesh.material = material;
    }
  }

  static appearanceB(
    genome: Genome,
    mesh: THREE.Mesh,
    geometry: THREE.BufferGeometry,
    material: THREE.MeshBasicMaterial
  ): void {
    if (!geometry) {
      geometry = new THREE.BufferGeometry();
    }
    const geo1 = new THREE.CapsuleGeometry(
      genome.words[9] * genome.words[6] * 0.1 + 0.1,
      genome.words[2] * 0.3 + 0.1,
      4,
      8
    );
    const geo2 = new THREE.CapsuleGeometry(
      genome.words[11] * 0.1 + 0.1,
      genome.words[11] * 0.1 + 0.1,
      4,
      8
    );
    geo2.translate(0, genome.words[11] * 0.1, 0);
    // geometry = new BufferGeometry();
    material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        `rgb(${Math.floor(genome.words[6] * 100)}, ${
          Math.floor(genome.words[7] * 100) + 150
        }, ${Math.floor(genome.words[4] * 100)})`
      ),
    });
    geometry = BufferGeometryUtils.mergeBufferGeometries([geo1, geo2]);
    if (mesh?.material) {
      mesh.geometry = geometry;
      mesh.material = material;
    }
  }
}
