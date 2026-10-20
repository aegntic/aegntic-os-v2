import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createArchitecture } from './architecture.js';

const views=Object.freeze({
  core:{position:[6.3,4.8,7.1],target:[0,1.6,0],fov:36,label:'Assembly / a visual study of durable work'},
  plan:{position:[12,20,15],target:[0,0.7,0],fov:43,label:'The plan / solid foundations and future wings'},
  next:{position:[10.7,4.1,5.2],target:[5.6,1.2,0],fov:37,label:'The next layer / planned shared services'}
});

export function initPavilion(host,{onStatus=()=>{}}={}) {
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor(0xebece4,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;renderer.shadowMap.autoUpdate=false;
  renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xebece4,35,90);
  const camera=new THREE.PerspectiveCamera(36,1,0.1,150);
  const environmentScene=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);
  const environment=pmrem.fromScene(environmentScene,0.05);scene.environment=environment.texture;
  environmentScene.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff,0x777864,2.0));
  const sun=new THREE.DirectionalLight(0xfff7e4,3.1);sun.position.set(-7,12,8);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:1,far:50});sun.shadow.normalBias=0.04;scene.add(sun);
  const rim=new THREE.DirectionalLight(0xc6e7eb,2.2);rim.position.set(6,4,-8);scene.add(rim);
  const architecture=createArchitecture();scene.add(architecture.root);
  let view='core',paused=true,compact=false,destroyed=false,visible=false,frame=0,lastFrame=0,moving=false,clock=0;
  const target=new THREE.Vector3();const desiredPos=new THREE.Vector3();const desiredTarget=new THREE.Vector3();
  function applyView(name,snap=false) {
    if(!Object.hasOwn(views,name))return;
    view=name;const entry=views[name];desiredPos.set(...entry.position);desiredTarget.set(...entry.target);
    architecture.setView(name);camera.fov=entry.fov;camera.updateProjectionMatrix();
    if(snap){camera.position.copy(desiredPos);target.copy(desiredTarget);}else moving=true;
    renderer.shadowMap.needsUpdate=true;onStatus(entry.label);schedule();
  }
  function draw(now) {
    frame=0;if(destroyed||!visible||document.hidden)return;
    const dt=Math.min((now-lastFrame)/1000||0.016,0.05);lastFrame=now;
    if(!paused)clock+=dt;
    const factor=1-Math.exp(-dt*7);
    camera.position.lerp(desiredPos,factor);target.lerp(desiredTarget,factor);camera.lookAt(target);
    moving=camera.position.distanceToSquared(desiredPos)>0.00001||target.distanceToSquared(desiredTarget)>0.00001;
    architecture.update(clock,compact);renderer.render(scene,camera);
    if(moving||!paused)schedule();
  }
  function schedule(){if(!frame&&visible&&!destroyed&&!document.hidden)frame=requestAnimationFrame(draw);}
  const resize=new ResizeObserver(()=>{
    const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();schedule();
  });
  const observer=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;lastFrame=performance.now();if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}
  },{rootMargin:'80px'});
  const visibility=()=>{lastFrame=performance.now();schedule();};
  const lost=(event)=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;host.classList.remove('scene-ready');onStatus('Static study / graphics unavailable');};
  const restored=()=>{host.classList.add('scene-ready');renderer.shadowMap.needsUpdate=true;schedule();};
  document.addEventListener('visibilitychange',visibility);
  renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
  host.append(renderer.domElement);host.classList.add('scene-ready');resize.observe(host);observer.observe(host);applyView('core',true);
  return {
    setView(name){applyView(name,matchMedia('(prefers-reduced-motion: reduce)').matches);},
    setPaused(value){paused=Boolean(value);lastFrame=performance.now();schedule();},
    setCompact(value){compact=Boolean(value);renderer.shadowMap.needsUpdate=true;schedule();},
    getState(){return {view,paused,visible,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};},
    destroy(){
      if(destroyed)return;destroyed=true;cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();
      document.removeEventListener('visibilitychange',visibility);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);
      architecture.dispose();environment.dispose();sun.shadow.map?.dispose();renderer.dispose();renderer.domElement.remove();host.classList.remove('scene-ready');
    }
  };
}
