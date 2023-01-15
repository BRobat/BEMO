import { Vector3, Triangle } from "three";
import { Organism } from "../parts/organism";
import { Obstacle } from "../parts/obstacle";
import { Entity } from "../parts/entity";
import { Eye } from "../parts/eye";
import { MathFunctions } from "./math";
import { EnergyPack } from "../parts/energyPack";
import { HashUtils } from "./hashUtils";
import { random16 } from "three/src/math/MathUtils";

export class Physics {
  static collideEntities(
    es: Entity[],
    hashList: Map<string, number[]>,
    hashThreshold: number
  ) {
    if (!es || es.length === 0) {
      return;
    }
    es.forEach((e1: Entity, j) => {
      if (!(e1 instanceof Organism) || e1.isDead || !e1.hasMouth) {
        return;
      }
      const eHash = HashUtils.getEntityHash(e1, hashThreshold);
      const allHashes = HashUtils.getNearHashes(eHash).concat([eHash]);
      let indexes: number[] = [];
      let toDestroyIndexes = [];
      allHashes.forEach((hashKey: string) => {
        const hash = hashList.get(hashKey);
        if (hash && hash.length !== 0) {
          indexes = indexes.concat(hash);
        }
      });
      indexes = [...new Set(indexes)];
      e1.eyes.forEach((eye) => {
        let hit = false;
        let distance = e1.attributes.eyeSight;
        let target: Entity;
        indexes.forEach((i: number) => {
          const org = es[i] as Organism;
          const newDistance = e1.mesh.position.distanceTo(org.mesh.position);
          if (newDistance < distance) {
            distance = newDistance;
            target = org;
            hit = true;
          }
        });
        if (hit) {
          if (target instanceof Organism) {
            eye.hit(
              distance,
              e1.genome.getUnSimilarityTo(target.genome),
              new Vector3(1, 0, 0)
                .applyAxisAngle(new Vector3(0, 0, 1), -e1.rotation)
                .angleTo(target.mesh.position)
            );
          }
        }
      });

      indexes.forEach((i: number) => {
        if (Physics.collisionDetection(e1, es[i])) {
          if (es[i] instanceof Organism) {
            if (e1.isAggresive && e1 != es[i]) {
              const org = es[i] as Organism;
              e1.energy += org.energy;
              org.kill("killed");
            }
          } else {
            const energy = es[i] as EnergyPack;
            e1.addEnergy(energy.energy);
            energy.deactivate();
          }
        }
      });
    });
  }

  static collisionDetection(e1: Entity, es: Entity) {
    if (e1.mesh.position.distanceTo(es.mesh.position) <= 0.3) {
      return true;
    } else {
      return false;
    }
  }
}
