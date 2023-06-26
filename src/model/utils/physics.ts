// TODO: Check if interactions can be made even when organism brain is slow

import { Vector3, Triangle } from "three";
import { Organism } from "../parts/organism";
import { Entity, EntityType } from "../parts/entity";
import { HashUtils } from "./hashUtils";
import { EntityInteractions } from "./entityInteractions";

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
      if (
        !(e1 instanceof Organism) ||
        e1.isDead ||
        (e1.type == EntityType.A && e1.timeAlive > 100) // it lets A make interactions for 100 ticks after its birth
      ) {
        return;
      }
      const eHash = HashUtils.getEntityHash(e1, hashThreshold);
      const nearHashes = HashUtils.getNearHashes(eHash).concat([eHash]);
      let indexes: number[] = [];
      nearHashes.forEach((hashKey: string) => {
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
        const newDistance =
          e1.mesh.position.distanceTo(es[i].mesh.position) - es[i].size;
        if (newDistance < distance) {
          const rotationVector = new Vector3(0, 1, 0).applyAxisAngle(
            new Vector3(0, 0, 1),
            e1.rotation
          );

          const relativePosition = new Vector3(
            (e1.mesh.position.x - es[i].mesh.position.x) / newDistance,
            (e1.mesh.position.y - es[i].mesh.position.y) / newDistance,
            0
          );
          const cross = new Vector3();
          cross.crossVectors(rotationVector, relativePosition);
          const direction = Math.sign(cross.z);
          const angle = rotationVector.angleTo(relativePosition);

          let positiveAngle = direction * angle;
          if (positiveAngle === undefined) {
            positiveAngle = 0;
          }
          if (positiveAngle > Math.PI * 2) {
            positiveAngle -= Math.PI * 2;
          } else if (positiveAngle < 0) {
            positiveAngle += Math.PI * 2;
          }

          e1.eyes.hit(newDistance, e1.type, es[i].type, positiveAngle);
        }

        if (Physics.collisionDetection(e1, es[i])) {
          EntityInteractions.interact(e1, es[i]);
        }
      });
    });
  }

  static collisionDetection(e1: Entity, es: Entity) {
    if (
      e1.mesh.position.distanceTo(es.mesh.position) <= e1.size + es.size &&
      e1 != es
    ) {
      return true;
    } else {
      return false;
    }
  }
}
