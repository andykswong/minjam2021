import * as THREE from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';
import { DULL_WOOD_MAT, LIGHT_STONE_MAT, SHINY_MAT, WOOD_MAT } from '../material';

const scytheWoodGeo = new THREE.BoxGeometry(0.5, 15, 0.5);
scytheWoodGeo.translate(0, 4, 0);

const scytheBladeGeo = (() => {
  const scytheBladeGeo = new THREE.BoxGeometry(6, 0.5, 0.5);
  scytheBladeGeo.translate(2.5, 10, 0);
  const scytheBlade2Geo = new THREE.ConeGeometry(0.35, 4, 4);
  scytheBlade2Geo.rotateZ(-Math.PI * .7);
  scytheBlade2Geo.translate(7, 8.8, 0);
  return BufferGeometryUtils.mergeBufferGeometries([scytheBladeGeo, scytheBlade2Geo]);
})();

export function createScythe(): THREE.Mesh {
  const mesh = new THREE.Mesh(scytheWoodGeo, DULL_WOOD_MAT);
  mesh.add(new THREE.Mesh(scytheBladeGeo, SHINY_MAT));
  return mesh;
}

const graveGeo = (() => {
  const baseGeo = new THREE.BoxGeometry(7, 1, 7);
  baseGeo.translate(0, 0.5, 0);
  const baseTopGeo = new THREE.CylinderGeometry(3.5, 4.5, 3, 4);
  baseTopGeo.rotateY(Math.PI/4);
  baseTopGeo.translate(0, 2, 0);
  
  const cross1Geo = new THREE.BoxGeometry(1, 15, 1);
  cross1Geo.translate(0, 10, 0);
  const cross2Geo = new THREE.BoxGeometry(8, 1, 1);
  cross2Geo.translate(0, 12.5, 0);

  return BufferGeometryUtils.mergeBufferGeometries([baseGeo, baseTopGeo, cross1Geo, cross2Geo]);
})();

export function createGrave(): THREE.Mesh {
  const mesh = new THREE.Mesh(graveGeo, LIGHT_STONE_MAT);
  mesh.castShadow = true;
  return mesh;
}

const grave2Geo = (() => {
  const baseGeo = new THREE.CylinderGeometry(4.5, 5, 2, 4);
  baseGeo.rotateY(Math.PI/4);
  baseGeo.scale(1, 1, 0.3);
  baseGeo.translate(0, 2, 0);
  const paneGeo = new THREE.BoxGeometry(6, 6, 1.5);
  paneGeo.translate(0, 6, 0);
  
  const topGeo = new THREE.ConeGeometry(5, 1, 4);
  topGeo.rotateY(Math.PI/4);
  topGeo.scale(1, 1, 0.3);
  topGeo.translate(0, 10, 0);
  const topGeo2 = new THREE.BoxGeometry(7, 1, 1.5);
  topGeo2.translate(0, 9, 0);

  return BufferGeometryUtils.mergeBufferGeometries([baseGeo, paneGeo, topGeo, topGeo2]);
})();

export function createGrave2(): THREE.Mesh {
  const mesh = new THREE.Mesh(grave2Geo, LIGHT_STONE_MAT);
  mesh.castShadow = true;
  return mesh;
}

const grave3Geo = (() => {
  const cross1Geo = new THREE.BoxGeometry(1, 9.5, 1);
  cross1Geo.translate(0, 4, 0);
  cross1Geo.rotateY(Math.PI/8);
  cross1Geo.rotateZ(Math.PI/16);
  const cross2Geo = new THREE.BoxGeometry(5, 1, 1);
  cross2Geo.translate(0, 7, 0);
  cross2Geo.rotateY(Math.PI/8);
  cross2Geo.rotateZ(Math.PI/16);
  const baseGeo = new THREE.CylinderGeometry(2.7, 3, 2, 6);
  baseGeo.rotateY(Math.PI/4);
  baseGeo.translate(0, 2, 0);
  return BufferGeometryUtils.mergeBufferGeometries([cross1Geo, cross2Geo, baseGeo]);
})();

export function createGrave3(): THREE.Mesh {
  const mesh = new THREE.Mesh(grave3Geo, LIGHT_STONE_MAT);
  mesh.castShadow = true;
  return mesh;
}

const stonesGeo = (() => {
  const stone1Geo = new THREE.BoxGeometry(2, 1.5, 1.5);
  stone1Geo.translate(-3, 1, -2);
  stone1Geo.rotateY(Math.PI/8);
  stone1Geo.rotateZ(Math.PI/16);
  const stone2Geo = new THREE.CylinderGeometry(1.7, 2, 1.2, 6);
  stone2Geo.rotateY(Math.PI/4);
  stone2Geo.translate(0.5, 0.6, 1);
  const stone3Geo = new THREE.BoxGeometry(2.1, 1.5, 1.75);
  stone3Geo.rotateY(-Math.PI/4);
  stone3Geo.translate(3, 1, -2);
  return BufferGeometryUtils.mergeBufferGeometries([stone1Geo, stone2Geo, stone3Geo]);
})();

export function createStones(): THREE.Mesh {
  const mesh = new THREE.Mesh(stonesGeo, LIGHT_STONE_MAT);
  mesh.castShadow = true;
  return mesh;
}

const treeGeo = (() => {
  const trunkGeo = new THREE.CylinderGeometry(0.7, 1.3, 14, 6);
  trunkGeo.translate(0, 6, 0);
  trunkGeo.rotateX(Math.PI/12);
  const trunk2Geo = new THREE.CylinderGeometry(0.4, 0.7, 5, 6);
  trunk2Geo.translate(0, 8, 0);
  trunk2Geo.rotateY(-Math.PI/8);
  trunk2Geo.rotateZ(-Math.PI/6);
  trunk2Geo.translate(-2.5, 4, 2.3);
  const trunk3Geo = new THREE.CylinderGeometry(0.4, 0.6, 4, 6);
  trunk3Geo.translate(0, 7, 0);
  trunk3Geo.rotateY(-Math.PI/4);
  trunk3Geo.rotateZ(Math.PI/6);
  trunk3Geo.translate(2, 1, 1.3);
  return BufferGeometryUtils.mergeBufferGeometries([trunk2Geo, trunkGeo, trunk3Geo]);
})();

export function createTree(): THREE.Mesh {
  const mesh = new THREE.Mesh(treeGeo, WOOD_MAT);
  mesh.castShadow = true;
  return mesh;
}
