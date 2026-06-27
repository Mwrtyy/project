import * as THREE from 'three';
import { lerp } from '../core/maths.js';

export class PhoneScene {
  constructor({ profile, loop }) { this.profile = profile; this.loop = loop; this.canvas = document.querySelector('[data-webgl]'); this.fallback = document.querySelector('[data-phone-fallback]'); this.pointer = { x:0, y:0, sx:0, sy:0 }; this.onResize=this.onResize.bind(this); this.onPointer=this.onPointer.bind(this); this.tick=this.tick.bind(this); }
  init() {
    if (!this.canvas || !this.profile.webgl || this.profile.lowPower) { this.showFallback(); return; }
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(32, innerWidth/innerHeight, .1, 100); this.camera.position.set(0,0,8.6);
    this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, alpha:true, antialias:true, powerPreference:'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); this.renderer.setSize(innerWidth,innerHeight,false); this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.08;
    this.setupEnvironment(); this.createPhone(); this.onResize(); addEventListener('resize', this.onResize, { passive:true }); addEventListener('pointermove', this.onPointer, { passive:true }); this.unsubscribe = this.loop.add(this.tick);
  }
  setupEnvironment() { const pmrem = new THREE.PMREMGenerator(this.renderer); const env = new THREE.Scene(); env.background = new THREE.Color(0x090a0d); const a = new THREE.Mesh(new THREE.PlaneGeometry(4,2), new THREE.MeshBasicMaterial({color:0xffffff})); a.position.set(-2,2,3); env.add(a); const b = new THREE.Mesh(new THREE.PlaneGeometry(2,5), new THREE.MeshBasicMaterial({color:0x9aa1aa})); b.position.set(3,0,2); env.add(b); this.scene.environment = pmrem.fromScene(env,.04).texture; pmrem.dispose(); }
  createPhone() {
    this.phone = new THREE.Group();
    const metal = new THREE.MeshPhysicalMaterial({ color:0xbec3ca, metalness:.92, roughness:.23, clearcoat:1, clearcoatRoughness:.18 });
    this.phone.add(new THREE.Mesh(new THREE.BoxGeometry(2.48,5.25,.26,6,12,2), metal));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.22,4.88), new THREE.MeshBasicMaterial({ color:0x05070a })); screen.position.z=.142; this.phone.add(screen);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.12,4.78), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:.07, depthWrite:false })); glass.position.z=.146; this.phone.add(glass);
    const island = new THREE.Mesh(new THREE.CapsuleGeometry(.19,.54,8,16), new THREE.MeshBasicMaterial({ color:0x000000 })); island.rotation.z=Math.PI/2; island.position.set(0,2.15,.151); this.phone.add(island);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.02,.012,6,120), new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:.18 })); ring.scale.set(.62,1.28,1); ring.position.z=.151; this.phone.add(ring);
    this.phone.position.set(2.25,-.15,0); this.phone.rotation.y=-.25; this.phone.scale.setScalar(.8); this.scene.add(this.phone);
  }
  onResize() { if(!this.renderer || !this.camera) return; this.camera.aspect=innerWidth/innerHeight; this.camera.updateProjectionMatrix(); this.renderer.setSize(innerWidth,innerHeight,false); if(!this.phone)return; if(innerWidth<760){this.phone.position.x=0;this.phone.position.y=-.4;this.phone.scale.setScalar(.58);this.camera.position.z=9.8;} else if(innerWidth<1080){this.phone.position.x=.9;this.phone.scale.setScalar(.66);this.camera.position.z=9.2;} else {this.phone.position.x=2.25;this.phone.scale.setScalar(.8);this.camera.position.z=8.6;} }
  onPointer(e){ this.pointer.x=(e.clientX/innerWidth-.5)*2; this.pointer.y=(e.clientY/innerHeight-.5)*2; }
  tick(delta,time){ if(!this.renderer||!this.scene||!this.camera||!this.phone)return; this.pointer.sx=lerp(this.pointer.sx,this.pointer.x,.06); this.pointer.sy=lerp(this.pointer.sy,this.pointer.y,.06); this.phone.rotation.y=-.22+this.pointer.sx*.18; this.phone.rotation.x=-this.pointer.sy*.12; this.phone.position.y += Math.sin(time*.0011)*.0009; this.camera.lookAt(this.phone.position.x*.38,0,0); this.renderer.render(this.scene,this.camera); }
  showFallback(){ if(this.fallback) this.fallback.setAttribute('aria-hidden','false'); }
  destroy(){ removeEventListener('resize',this.onResize); removeEventListener('pointermove',this.onPointer); this.unsubscribe?.(); this.renderer?.dispose(); }
}
