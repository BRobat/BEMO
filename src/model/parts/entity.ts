import * as THREE from "three";

export enum EntityType {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  EA = "EA",
  EBCD = "EBCD",
}

export class Entity {
  public mesh: THREE.Mesh;
  public energy: number;
  public type: string;
}
