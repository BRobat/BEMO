// shiet, appearance could be defined by attributes, not genes.

import * as THREE from "three";
import { Genome } from "../parts/genome";
import { EntityType } from "../parts/entity";
import { BufferGeometry } from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

export class Appearance {
  static createAppearance(
    genome: Genome,
    type: string,
    mesh: THREE.Mesh,
    geometry: THREE.BufferGeometry,
    material: THREE.Material | THREE.Material[]
  ): THREE.Mesh {
    switch (type) {
      case EntityType.A:
        return this.appearanceA(genome, mesh, geometry, material);
      case EntityType.B:
        return this.appearanceB(genome, mesh, geometry, material);
      case EntityType.C:
        return this.appearanceC(genome, mesh, geometry, material);
      case EntityType.D:
        return this.appearanceD(genome, mesh, geometry, material);
    }
  }

  static appearanceA(
    genome: Genome,
    mesh: THREE.Mesh,
    geometry: BufferGeometry,
    material: THREE.Material | THREE.Material[]
  ): THREE.Mesh {
    if (!geometry) {
      geometry = new THREE.BufferGeometry();
    }
    const body = new THREE.CapsuleGeometry(
      genome.words[9] * genome.words[6] * 0.3 + 0.1,
      genome.words[6] * 2 + 0.1,
      4,
      8
    );

    const head = new THREE.ConeGeometry(
      genome.words[7] * genome.words[6] * 1,
      genome.words[6] + 0.2,
      8,
      8
    );

    const mat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        `rgb(${Math.floor(genome.words[6] * 50)}, ${Math.floor(
          genome.words[7] * 50
        )}, ${Math.floor(genome.words[4] * 50)})`
      ),
    });

    const mat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        `rgb(${Math.floor(genome.words[6] * 50 + genome.words[14] * 100)}, ${
          Math.floor(genome.words[7] * 50) + 100
        }, ${Math.floor(genome.words[4] * 50 + genome.words[15] * 100)})`
      ),
    });
    body.rotateX(Math.PI / 2);
    head.rotateX(-Math.PI / 2);
    head.translate(0, 0, genome.words[6] * 0.6 + 0.2);

    geometry = BufferGeometryUtils.mergeBufferGeometries([body, head]);
    geometry.addGroup(0, body.getIndex().count, 0);
    geometry.addGroup(body.getIndex().count, head.getIndex().count, 1);

    material = [mat1, mat2];

    if (mesh) {
      mesh.geometry = geometry;
      mesh.material = material;
    } else {
      mesh = new THREE.Mesh(geometry, material);
    }
    return mesh;
  }

  static appearanceB(
    genome: Genome,
    mesh: THREE.Mesh,
    geometry: BufferGeometry,
    material: THREE.Material | THREE.Material[]
  ): THREE.Mesh {
    if (!geometry) {
      geometry = new THREE.BufferGeometry();
    }
    const body = new THREE.CapsuleGeometry(
      genome.words[9] * 0.1 + 0.15,
      genome.words[6] * 0.3 + 0.1,
      4,
      8
    );
    const head = new THREE.CapsuleGeometry(
      genome.words[11] * 0.1 + 0.05,
      genome.words[11] * 0.05,
      4,
      4
    );

    const eye = new THREE.CapsuleGeometry(
      genome.words[4] * 0.05,
      genome.words[4] * 0.025,
      4,
      4
    );

    const mat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        `rgb(${Math.floor(genome.words[6] * 50)}, ${Math.floor(
          genome.words[7] * 50
        )}, ${Math.floor(genome.words[4] * 50 + 50)})`
      ),
    });

    const mat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(`rgb(250,250,250)`),
    });

    head.translate(0, genome.words[2] * 0.3 + 0.15, 0);
    eye.translate(
      0,
      genome.words[2] * 0.3 + 0.15,
      genome.words[11] * 0.1 + 0.05
    );

    geometry = BufferGeometryUtils.mergeBufferGeometries([body, head, eye]);
    geometry.addGroup(0, body.getIndex().count, 0);
    geometry.addGroup(body.getIndex().count, head.getIndex().count, 0);
    geometry.addGroup(
      head.getIndex().count + body.getIndex().count,
      eye.getIndex().count,
      1
    );
    material = [mat1, mat2];
    if (mesh) {
      mesh.geometry = geometry;
      mesh.material = material;
    } else {
      mesh = new THREE.Mesh(geometry, material);
    }
    return mesh;
  }

  static appearanceC(
    genome: Genome,
    mesh: THREE.Mesh,
    geometry: BufferGeometry,
    material: THREE.Material | THREE.Material[]
  ): THREE.Mesh {
    if (!geometry) {
      geometry = new THREE.BufferGeometry();
    }
    const body = new THREE.CapsuleGeometry(
      genome.words[9] * genome.words[6] * 0.1 + 0.15,
      genome.words[2] * 0.3 + 0.1,
      4,
      8
    );
    const head = new THREE.CapsuleGeometry(
      genome.words[11] * 0.1 + 0.05,
      genome.words[11] * 0.05,
      4,
      4
    );

    const eye = new THREE.CapsuleGeometry(
      genome.words[4] * 0.05,
      genome.words[4] * 0.025,
      4,
      4
    );

    const mat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        `rgb(${Math.floor(genome.words[6] * 50 + 50)}, ${Math.floor(
          genome.words[7] * 50
        )}, ${Math.floor(genome.words[4] * 50 + 50)})`
      ),
    });

    const mat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(`rgb(250,250,250)`),
    });

    head.translate(0, genome.words[2] * 0.3 + 0.15, 0);
    eye.translate(
      0,
      genome.words[2] * 0.3 + 0.15,
      genome.words[11] * 0.1 + 0.05
    );

    geometry = BufferGeometryUtils.mergeBufferGeometries([body, head, eye]);
    geometry.addGroup(0, body.getIndex().count, 0);
    geometry.addGroup(body.getIndex().count, head.getIndex().count, 0);
    geometry.addGroup(
      head.getIndex().count + body.getIndex().count,
      eye.getIndex().count,
      1
    );
    material = [mat1, mat2];
    if (mesh) {
      mesh.geometry = geometry;
      mesh.material = material;
    } else {
      mesh = new THREE.Mesh(geometry, material);
    }
    return mesh;
  }

  static appearanceD(
    genome: Genome,
    mesh: THREE.Mesh,
    geometry: BufferGeometry,
    material: THREE.Material | THREE.Material[]
  ): THREE.Mesh {
    if (!geometry) {
      geometry = new THREE.BufferGeometry();
    }
    const body = new THREE.CapsuleGeometry(
      genome.words[9] * genome.words[6] * 0.1 + 0.15,
      genome.words[2] * 0.3 + 0.1,
      4,
      8
    );
    const head = new THREE.CapsuleGeometry(
      genome.words[11] * 0.1 + 0.05,
      genome.words[11] * 0.05,
      4,
      4
    );

    const eye = new THREE.CapsuleGeometry(
      genome.words[4] * 0.05,
      genome.words[4] * 0.025,
      4,
      4
    );

    const mat1 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        `rgb(${Math.floor(genome.words[6] * 50 + 50)}, ${Math.floor(
          genome.words[7] * 50
        )}, ${Math.floor(genome.words[4] * 50)})`
      ),
    });

    const mat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(`rgb(250,250,250)`),
    });

    head.translate(0, genome.words[2] * 0.3 + 0.15, 0);
    eye.translate(
      0,
      genome.words[2] * 0.3 + 0.15,
      genome.words[11] * 0.1 + 0.05
    );

    geometry = BufferGeometryUtils.mergeBufferGeometries([body, head, eye]);
    geometry.addGroup(0, body.getIndex().count, 0);
    geometry.addGroup(body.getIndex().count, head.getIndex().count, 0);
    geometry.addGroup(
      head.getIndex().count + body.getIndex().count,
      eye.getIndex().count,
      1
    );
    material = [mat1, mat2];
    if (mesh) {
      mesh.geometry = geometry;
      mesh.material = material;
    } else {
      mesh = new THREE.Mesh(geometry, material);
    }
    return mesh;
  }
}
