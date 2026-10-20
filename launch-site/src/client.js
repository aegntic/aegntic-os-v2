import { initSiteUI } from './site-ui.js';

// HTML, navigation and signup initialize before the optional graphics module.
initSiteUI();
const host=document.querySelector('#scene');
const status=document.querySelector('#scene-status');
const quality=document.querySelector('#quality');
const motion=document.querySelector('#motion');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const wide=matchMedia('(min-width: 900px)');
const touch=matchMedia('(pointer: coarse)');
let renderer=null,version=0,selectedView='core',paused=true,manualChoice=false,qualityMode='static';
function showStatus(text){if(status)status.textContent=text;}
async function setQuality(mode){
  qualityMode=mode;
  const attempt=++version;renderer?.destroy();renderer=null;
  if(quality)quality.value=mode;
  document.querySelectorAll('[data-view]').forEach(button=>{button.disabled=true;});
  if(motion){motion.disabled=mode==='static';motion.textContent=paused?'Play ambient motion':'Pause ambient motion';motion.setAttribute('aria-pressed',String(!paused));}
  if(mode==='static'){showStatus('Architectural study / static view');return;}
  showStatus('Preparing architectural study…');
  try{
    const {initPavilion}=await import('./pavilion.js');
    if(attempt!==version)return;
    renderer=initPavilion(host,{onStatus:showStatus});renderer.setView(selectedView);renderer.setPaused(paused);
    document.querySelectorAll('[data-view]').forEach(button=>{button.disabled=false;});
  }catch{
    renderer?.destroy();renderer=null;
    qualityMode='static';if(quality)quality.value='static';if(motion)motion.disabled=true;
    showStatus('Static study / interactive graphics unavailable');
  }
}
window.addEventListener('pavilion:view',event=>{selectedView=event.detail.view;renderer?.setView(selectedView);});
window.addEventListener('pavilion:motion',event=>{paused=event.detail.paused;renderer?.setPaused(paused);});
window.addEventListener('pavilion:quality',event=>{manualChoice=true;setQuality(event.detail.quality);});
const adapt=()=>{if(reduced.matches){paused=true;setQuality('static');}else if(!manualChoice)setQuality(wide.matches&&!touch.matches?'standard':'static');};
reduced.addEventListener('change',adapt);wide.addEventListener('change',adapt);touch.addEventListener('change',adapt);
window.addEventListener('pagehide',()=>{++version;renderer?.destroy();renderer=null;});
window.addEventListener('pageshow',event=>{if(event.persisted)setQuality(reduced.matches?'static':qualityMode);});
adapt();
