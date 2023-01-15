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
        let hitOrganism = false;
        let organismDistance = 10000;
        let hitEnergyPack = false;
        let energyPackDistance = 10000;
        indexes.forEach((i: number) => {
          if (es[i] instanceof Organism) {
            const org = es[i] as Organism;
            const visionTriangle = new Triangle(
              eye.direction2
                .clone()
                .applyAxisAngle(new Vector3(0, 0, 1), -e1.rotation)
                .add(e1.mesh.position),
              e1.mesh.position,
              eye.direction1
                .clone()
                .applyAxisAngle(new Vector3(0, 0, 1), -e1.rotation)
                .add(e1.mesh.position)
            );
            if (visionTriangle.containsPoint(org.mesh.position)) {
              hitOrganism = true;
              const newDistance = e1.mesh.position.distanceTo(
                org.mesh.position
              );
              if (newDistance < organismDistance) {
                organismDistance = newDistance;
              }
            }
            if (hitOrganism) {
              eye.hitOrganism(
                organismDistance,
                e1.genome.getUnSimilarityTo(org.genome)
              );
            } else {
              eye.unhitOrganism();
            }
          } else if (es[i] instanceof EnergyPack) {
            const ePack = es[i] as EnergyPack;
            const visionTriangle = new Triangle(
              eye.direction2
                .clone()
                .applyAxisAngle(new Vector3(0, 0, 1), -e1.rotation)
                .add(e1.mesh.position),
              e1.mesh.position,
              eye.direction1
                .clone()
                .applyAxisAngle(new Vector3(0, 0, 1), -e1.rotation)
                .add(e1.mesh.position)
            );
            if (visionTriangle.containsPoint(ePack.mesh.position)) {
              hitEnergyPack = true;
              const newDistance = e1.mesh.position.distanceTo(
                ePack.mesh.position
              );
              if (newDistance < energyPackDistance) {
                energyPackDistance = newDistance;
              }
            }
            if (hitEnergyPack) {
              eye.hitEnergyPack(energyPackDistance);
            } else {
              eye.unhitEnergyPack();
            }
          }
        });
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
