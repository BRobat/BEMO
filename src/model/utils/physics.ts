import { Vector3, Triangle } from "three";
import { Organism } from "../parts/organism";
import { Obstacle } from "../parts/obstacle";
import { Entity } from "../parts/entity";
import { Eye, Pixel } from "../parts/eye";
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
      allHashes.forEach((hashKey: string) => {
        const hash = hashList.get(hashKey);
        if (hash && hash.length !== 0) {
          indexes = indexes.concat(hash);
        }
      });
      indexes = [...new Set(indexes)];

      let distance = e1.attributes.eyeSight;
      indexes.forEach((i: number) => {
        if (es[i] instanceof Organism && es[i] == e1) {
          return;
        }
        const newDistance = e1.mesh.position.distanceTo(es[i].mesh.position);
        if (newDistance < distance) {
          const w = new Vector3(0, 1, 0).applyAxisAngle(
            new Vector3(0, 0, 1),
            e1.rotation
          );
          const cross = new Vector3();
          cross.crossVectors(w, es[i].mesh.position);
          const direction = Math.sign(cross.z);
          const angle = w.angleTo(es[i].mesh.position);

          let positiveAngle = direction * angle + Math.PI;
          if (positiveAngle > Math.PI * 2) {
            positiveAngle -= Math.PI * 2;
          } else if (positiveAngle < 0) {
            positiveAngle += Math.PI * 2;
          }

          if (es[i] instanceof Organism) {
            e1.eyes.hit(
              newDistance,
              e1.genome.getUnSimilarityTo((es[i] as Organism).genome),
              positiveAngle
            );
          } else {
            e1.eyes.hit(newDistance, 0, positiveAngle);
          }
        }
      });

      indexes.forEach((i: number) => {
        if (Physics.collisionDetection(e1, es[i])) {
          if (es[i] instanceof Organism) {
            if (e1.isAggresive && e1 != es[i]) {
              // TODO: later multiply by difference in masses or smth
              e1.speed = e1.speed.multiplyScalar(0.5);
              const org = es[i] as Organism;
              const dmg = e1.attack();
              org.takeDamage(dmg);
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
