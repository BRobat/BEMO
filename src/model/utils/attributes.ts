// everything seems to be good. But actually it doesn't work

import { Genome } from "../parts/genome";
import { Organism } from "../parts/organism";
import { firstNames, lastNames } from "../consts/names";
import { MaxAttributes } from "../consts/maxAttributes";
import { EntityType } from "../parts/entity";

export class AttributesUtils {
  static getAttributesBasedOnGenome(org: Organism): void {
    org.attributes.maxHP = this.setAttribute(
      org.genome,
      [9],
      [1],
      MaxAttributes.MAX_HEALTH
    );
    org.attributes.regeneration = this.setAttribute(
      org.genome,
      [10],
      [1],
      MaxAttributes.REGENERATION
    );
    org.attributes.attack = this.setAttribute(
      org.genome,
      [11],
      [1],
      MaxAttributes.ATTACK
    );
    org.attributes.defense = this.setAttribute(
      org.genome,
      [12],
      [1],
      MaxAttributes.DEFENSE
    );
    org.attributes.brainSpeed = this.setAttribute(
      org.genome,
      [13],
      [1],
      MaxAttributes.BRAIN_SPEED
    );
    org.attributes.baseEnergy = this.setAttribute(
      org.genome,
      [0],
      [1],
      MaxAttributes.BASE_ENERGY
    );
    org.attributes.maxEnergy = this.setAttribute(
      org.genome,
      [6],
      [1],
      MaxAttributes.MAX_ENERGY
    );
    org.attributes.mass = this.setAttribute(
      org.genome,
      [9],
      [1],
      MaxAttributes.MASS
    );
    org.attributes.energyGain = this.setAttribute(
      org.genome,
      [1],
      [1],
      MaxAttributes.ENERGY_GAIN
    );
    org.attributes.speedMultiplier = this.setAttribute(
      org.genome,
      [2, 7],
      [1, -3],
      MaxAttributes.SPEED_MULTIPLIER
    );
    org.attributes.moveDrain = this.setAttribute(
      org.genome,
      [2, 7],
      [1, -3],
      MaxAttributes.SPEED_MULTIPLIER
    );
    org.attributes.rotationMultiplier = this.setAttribute(
      org.genome,
      [3, 7],
      [1, -3],
      MaxAttributes.ROTATION_MULTIPLIER
    );
    org.attributes.eyeSight = this.setAttribute(
      org.genome,
      [4, 7],
      [1, -2],
      MaxAttributes.EYE_SIGHT
    );
    org.attributes.multiplyAge = this.setAttribute(
      org.genome,
      [5],
      [1],
      MaxAttributes.MULTIPLY_AGE
    );
    org.attributes.aging = this.setAttribute(
      org.genome,
      [1, 5],
      [2, 1],
      MaxAttributes.AGING
    );
    org.attributes.alertness = this.setAttribute(
      org.genome,
      [8],
      [1],
      MaxAttributes.ALERTNESS
    );
    org.attributes.size = this.setAttribute(
      org.genome,
      [6, 9],
      [2, 1],
      MaxAttributes.SIZE
    );
    org.attributes.organismTypeX = this.setAttribute(org.genome, [7], [1], 1);
    org.attributes.organismTypeY = this.setAttribute(org.genome, [13], [1], 1);
    org.attributes.nameX = this.setAttribute(org.genome, [14], [1], 1);
    org.attributes.nameY = this.setAttribute(org.genome, [15], [1], 1);

    org.attributes.fieldOfView = Math.PI; // unused

    org.attributes.energyDrain =
      (org.attributes.brainSize +
        org.attributes.eyeSight +
        org.attributes.defense) *
      0.001;
    //
    org.name =
      firstNames[Math.floor(org.genome.words[14] * firstNames.length)] +
      lastNames[Math.floor(org.genome.words[15] * lastNames.length)];
    org.hp = org.attributes.maxHP;
  }

  static setAttribute(
    genes: Genome,
    activeGenes: number[],
    weights: number[],
    maxValue: number
  ): number {
    if (activeGenes.length !== weights.length) {
      return 0;
    }
    let sum = 0;
    let weightSum = 0;
    for (let i = 0; i < activeGenes.length; i++) {
      if (weights[i] > 0) {
        sum += genes.words[i] * weights[i];
        weightSum += weights[i];
      } else {
        sum += (1 - genes.words[i]) * -weights[i];
        weightSum -= weights[i];
      }
    }
    return (sum / weightSum) * maxValue;
  }
}
