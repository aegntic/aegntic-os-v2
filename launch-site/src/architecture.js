import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createMaterials, labelTexture } from './materials.js';

// Geometry is a status illustration. It does not represent physical hardware or telemetry.
export function createArchitecture() {
  const root = new THREE.Group();
  const core = new THREE.Group(); const plan = new THREE.Group(); const future = new THREE.Group();
  root.add(core,plan,future);
  const m = createMaterials();
  const geometries = new Map();
  function box(parent, size, pos, material=m.metal, radius=0.04) {
    const key=JSON.stringify([...size,radius]);
    if (!geometries.has(key)) geometries.set(key,new RoundedBoxGeometry(...size,2,radius));
    const mesh=new THREE.Mesh(geometries.get(key),material);
    mesh.position.set(...pos); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
  }
  function outline(parent,size,pos,material=m.wire) {
    const key=`edge:${size.join(',')}`;
    if(!geometries.has(key)) {
      const shape=new THREE.BoxGeometry(...size); geometries.set(key,new THREE.EdgesGeometry(shape)); shape.dispose();
    }
    const line=new THREE.LineSegments(geometries.get(key),material);line.position.set(...pos);parent.add(line);return line;
  }
  // A single restrained plinth gives the object a physical reference and contact shadow.
  box(core,[5.4,0.24,4.7],[0,0.12,0],m.paper,0.1);
  box(core,[4.7,0.16,4.05],[0,0.31,0],m.dark,0.07);
  const layers=[];
  for(let i=0;i<3;i++) {
    const layer=new THREE.Group();core.add(layer);layers.push(layer);
    box(layer,[3.3,0.12,2.65],[0,0,0],m.chrome);
    box(layer,[3.12,0.19,2.48],[0,0.15,0],i===1?m.dark:m.metal);
    // The restrained rail is continuous; the object reads as a stack, not scattered kit.
    box(layer,[2.86,0.025,0.035],[0,0.255,1.19],m.light,0.009);
    for(const x of [-1.43,1.43]) for(const z of [-1.1,1.1]) {
      box(layer,[0.10,0.045,0.10],[x,0.265,z],m.dark,0.015);
    }
  }
  box(layers[0],[1.6,0.36,1.15],[0,0.43,0],m.dark,0.06);
  for(let i=0;i<9;i++) box(layers[0],[0.065,0.20,1.06],[-0.6+i*0.15,0.69,0],m.chrome,0.01);
  box(layers[1],[2.5,0.055,1.8],[0,0.30,0],m.metal);
  for(let i=0;i<3;i++) box(layers[1],[0.6,0.10,0.85],[-0.78+i*0.78,0.39,0],m.dark);
  box(layers[2],[2.9,0.49,2.2],[0,0.44,0],m.glass,0.11);
  box(layers[2],[3.05,0.08,2.35],[0,0.74,0],m.chrome);
  const plaqueMat=new THREE.MeshStandardMaterial({map:labelTexture('aegntic / assembly','A STUDY IN CONTINUITY'),roughness:0.65,metalness:0.2});
  const plaque=new THREE.Mesh(new THREE.PlaneGeometry(1.82,0.455),plaqueMat);
  plaque.rotation.x=-Math.PI/2;plaque.position.set(0,0.785,0);layers[2].add(plaque);
  // Repeated rails share one geometry and one draw call.
  const railGeometry=new THREE.CylinderGeometry(0.026,0.026,3.0,12);
  const rails=new THREE.InstancedMesh(railGeometry,m.chrome,4);const matrix=new THREE.Matrix4();
  let railIndex=0;for(const x of [-1.4,1.4])for(const z of [-1.08,1.08]){matrix.makeTranslation(x,1.88,z);rails.setMatrixAt(railIndex++,matrix);}rails.castShadow=true;core.add(rails);

  // Six gallery wings are legible from the plan, without a compulsory walkthrough.
  const wingPositions=[[-5,0.16,3.4],[-5,0.16,-1.4],[-0.2,0.16,-5],[4.7,0.16,-3.4],[5,0.16,1],[0.2,0.16,5.2]];
  for(const [i,pos] of wingPositions.entries()) {
    const wing=new THREE.Group();wing.position.set(...pos);plan.add(wing);
    if(i<3) {
      box(wing,[3.7,0.18,3.2],[0,0,0],m.paper);
      box(wing,[3.7,0.62,0.09],[0,0.37,-1.55],m.metal,0.02);
      box(wing,[0.09,0.62,3.2],[-1.8,0.37,0],m.metal,0.02);
      box(wing,[2.0,0.10,1.2],[0,0.22,0],m.dark);
    } else {
      outline(wing,[3.7,0.12,3.2],[0,0,0]);outline(wing,[3.7,1.3,3.2],[0,0.65,0]);
    }
  }
  const ring=new THREE.Mesh(new THREE.RingGeometry(3.25,3.30,80),m.dark);ring.rotation.x=-Math.PI/2;ring.position.y=0.028;plan.add(ring);
  // A small future gallery can be viewed without pretending these services are connected.
  future.position.set(5.6,0,0);
  outline(future,[4.2,0.15,3.9],[0,0.15,0],m.ink);
  outline(future,[4.2,2.9,3.9],[0,1.55,0],m.wire);
  for(const x of [-1.1,0,1.1]) {
    outline(future,[0.65,1.8,0.85],[x,1.07,0]);
    for(const y of [0.55,0.95,1.35])outline(future,[0.55,0.035,0.75],[x,y,0],m.ink);
  }
  box(future,[1.8,0.09,1.4],[0,0.22,0],m.paper);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),m.paper);floor.rotation.x=-Math.PI/2;floor.position.y=-0.035;floor.receiveShadow=true;root.add(floor);
  const grid=new THREE.GridHelper(24,24,0xc0cac3,0xd2d8d0);grid.position.y=-0.018;root.add(grid);
  function setView(view) {
    plan.visible=view==='plan';future.visible=view!=='core';grid.visible=view!=='core';
    core.visible=view!=='next';
  }
  function update(time,compact=false) {
    for(let i=0;i<layers.length;i++) layers[i].position.y=0.72+i*(compact?0.48:0.99);
    core.rotation.y=-0.18+Math.sin(time*0.24)*0.025;
  }
  function dispose() {
    const mats=new Set();const maps=new Set();const geos=new Set();
    root.traverse(object=>{
      if(object.geometry)geos.add(object.geometry);
      for(const material of [].concat(object.material||[])) {
        mats.add(material);for(const value of Object.values(material))if(value?.isTexture)maps.add(value);
      }
    });
    for(const resource of [...geos,...maps,...mats])resource.dispose();
  }
  update(0);setView('core');
  return {root,setView,update,dispose};
}
