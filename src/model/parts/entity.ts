import * as THREE from "three";

export enum EntityType {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  EA = "EA",
  EBCD = "EBCD",
  ROCK = "ROCK",
}

export class Entity {
  public mesh: THREE.Mesh;
  public energy: number;
  public type: string;
  public size: number;
  public mass: number;
  public uuid: string;
}
