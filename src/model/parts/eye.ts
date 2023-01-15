import { Vector3 } from "three";
import * as THREE from "three";

export class Eye {
  public fieofView: number;

  public active: boolean = false;
  public angle: number = 0;
  public distance: number = 0;
  public genomeDistance: number = 0;

  constructor(fieldOfView: number) {}

  hit(distance: number, genomeDistance: number, angle: number) {
    this.active = true;
    this.distance = distance;
    this.genomeDistance = genomeDistance;
    this.angle = angle;
  }

  public unhit() {
    this.active = false;
  }
}
