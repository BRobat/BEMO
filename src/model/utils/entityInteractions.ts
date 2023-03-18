import { Entity, EntityType } from "./../parts/entity";
import { Organism } from "./../parts/organism";
import { EnergyPack } from "./../parts/energyPack";

export class EntityInteractions {
  static interact(e1: Entity, e2: Entity): void {
    if (e2 instanceof Organism) {
      this.interactionOrganismOrganism(e1 as Organism, e2 as Organism);
    } else {
      this.interactionOrganismEnergyPack(e1 as Organism, e2 as EnergyPack);
    }
  }

  static interactionOrganismOrganism(o1: Organism, o2: Organism): void {
    if (o1 == o2) {
      return;
    }
    switch (o1.type) {
      case EntityType.B:
        if (o2.type == EntityType.A) {
          this.attack(o1, o2);
        }
        break;
      case EntityType.C:
        if (o2.type == EntityType.B || o2.type == EntityType.A) {
          this.attack(o1, o2);
        }
        break;
      case EntityType.D:
        if (
          o2.type == EntityType.C ||
          o2.type == EntityType.B ||
          o2.type == EntityType.D
        ) {
          this.attack(o1, o2);
        }
        break;
    }
  }

  static attack(o1: Organism, o2: Organism): void {
    o1.speed = o1.speed.multiplyScalar(0.5);
    o2.takeDamage(o1.attack());
    o1.takeDamage(o2.attack() / 4);
  }

  static interactionOrganismEnergyPack(o: Organism, e: EnergyPack): void {
    const energy = e as EnergyPack;
    o.addEnergy(energy.energy);
    energy.deactivate();
  }
}
