import { Entity, EntityType } from "./../parts/entity";
import { Organism } from "./../parts/organism";
import { EnergyPack } from "./../parts/energyPack";
import { Obstacle } from "../parts/obstacle";
import { Vector3 } from "three";

export class EntityInteractions {
  static interact(e1: Entity, e2: Entity): void {
    if (e2 instanceof Organism) {
      this.interactionOrganismOrganism(e1 as Organism, e2 as Organism);
    } else if (e2 instanceof EnergyPack) {
      this.interactionOrganismEnergyPack(e1 as Organism, e2 as EnergyPack);
    } else {
      this.interactionOrganismObstacle(e1 as Organism, e2 as Obstacle);
    }
  }

  static interactionOrganismOrganism(o1: Organism, o2: Organism): void {
    if (o1 == o2) {
      return;
    }
    switch (o1.type) {
      case EntityType.A:
        this.push(o1, o2);
        break;
      case EntityType.B:
        if (o2.type == EntityType.A) {
          this.attack(o1, o2);
        } else {
          this.push(o1, o2);
        }
        break;
      case EntityType.C:
        if (o2.type == EntityType.B || o2.type == EntityType.A) {
          this.attack(o1, o2);
        } else {
          this.push(o1, o2);
        }
        break;
      case EntityType.D:
        if (
          o2.type == EntityType.C ||
          o2.type == EntityType.B ||
          o2.type == EntityType.D
        ) {
          this.attack(o1, o2);
        } else {
          this.push(o1, o2);
        }
        break;
    }
  }

  static attack(o1: Organism, o2: Organism): void {
    o1.speed = o1.speed.multiplyScalar(0.5);
    o2.takeDamage(o1.attack());
    o1.takeDamage(o2.attack() / 16);
  }

  static interactionOrganismEnergyPack(o: Organism, e: EnergyPack): void {
    const energy = e as EnergyPack;
    o.addEnergy(energy.energy);
    energy.deactivate();
  }

  static interactionOrganismObstacle(o: Organism, obs: Obstacle): void {
    // push away from obstacle
    o.takeDamage(this.push(o, obs));
  }

  static push(e1: Organism, e2: Entity): number {
    let distance = e1.mesh.position.distanceTo(e2.mesh.position);

    //how force could be calculated?
    // const pushForce = 0.1 / (distance * distance);
    const pushForce = 0.1;
    const pushVector = new Vector3(
      (e1.mesh.position.x - e2.mesh.position.x) / distance,
      (e1.mesh.position.y - e2.mesh.position.y) / distance,
      0
    );
    e1.speed = e1.speed.add(pushVector.multiplyScalar(pushForce));
    return pushForce;
  }
}
