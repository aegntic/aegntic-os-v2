import * as THREE from 'three';

// Small deterministic surface maps keep the material family coherent and local.
export function createMaterials() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#aeb7ba'; ctx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y++) {
    ctx.fillStyle = `rgba(255,255,255,${0.03 + ((y * 17) % 11) / 100})`;
    ctx.fillRect(0, y, 128, 1);
  }
  const brush = new THREE.CanvasTexture(canvas);
  brush.colorSpace = THREE.SRGBColorSpace;
  brush.wrapS = brush.wrapT = THREE.RepeatWrapping;
  const metal = new THREE.MeshStandardMaterial({color:0xc1c9c9,metalness:0.9,roughness:0.31,map:brush});
  const chrome = new THREE.MeshStandardMaterial({color:0xdde3e1,metalness:1,roughness:0.16});
  const dark = new THREE.MeshStandardMaterial({color:0x1b292d,metalness:0.52,roughness:0.32});
  const paper = new THREE.MeshStandardMaterial({color:0xe7e5dc,metalness:0,roughness:0.95});
  const glass = new THREE.MeshPhysicalMaterial({color:0xe6f3f0,metalness:0,roughness:0.12,transmission:0.72,thickness:0.3,ior:1.45,transparent:true,opacity:0.85});
  const light = new THREE.MeshStandardMaterial({color:0x8eb6b2,emissive:0x598f8c,emissiveIntensity:0.65,roughness:0.4});
  const wire = new THREE.LineBasicMaterial({color:0x447b78,transparent:true,opacity:0.62});
  const ink = new THREE.LineBasicMaterial({color:0x5c6867,transparent:true,opacity:0.28});
  return {metal,chrome,dark,paper,glass,light,wire,ink};
}

export function labelTexture(title, subtitle) {
  const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 192;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle='#e1e7e4'; ctx.fillRect(0,0,768,192);
  ctx.fillStyle='#253e3d'; ctx.font='500 23px monospace'; ctx.fillText(subtitle,36,60);
  ctx.fillStyle='#152626'; ctx.font='600 57px sans-serif'; ctx.fillText(title,32,139);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace=THREE.SRGBColorSpace;
  return texture;
}
