(() => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new BABYLON.Engine(canvas, true);
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(.56,.73,.85,1);
  new BABYLON.HemisphericLight("sky",new BABYLON.Vector3(0,1,0),scene).intensity=.9;
  const sun = new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.4,-1,.3),scene);
  sun.position.set(20,35,-20); sun.intensity=.7;
  const material=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);return m};
  const grass=material("grass","#557b4b"),roadMat=material("road","#353c44"),blue=material("blue bus placeholder","#1764a3"),glass=material("glass","#9ecbd9"),rubber=material("rubber","#171b20"),white=material("building","#d9d3c6"),yellow=material("markings","#f3e8c8");
  const ground=BABYLON.MeshBuilder.CreateGround("ground",{width:180,height:500},scene);ground.position.z=100;ground.material=grass;
  const road=BABYLON.MeshBuilder.CreateBox("road",{width:12,height:.12,depth:500},scene);road.position.set(0,.02,100);road.material=roadMat;
  for(let z=-140;z<350;z+=12){const l=BABYLON.MeshBuilder.CreateBox("lane line",{width:.14,height:.025,depth:5},scene);l.position.set(0,.09,z);l.material=yellow}
  for(let i=0;i<24;i++){const side=i%2?-1:1,z=-110+i*19,w=5+(i%3)*2,h=5+(i%4)*1.5;const b=BABYLON.MeshBuilder.CreateBox("placeholder building",{width:w,height:h,depth:8},scene);b.position.set(side*(13+w/2),h/2,z);b.material=white}
  const bus=new BABYLON.TransformNode("bus",scene);
  const body=BABYLON.MeshBuilder.CreateBox("bus body",{width:2.55,height:3,depth:9.2},scene);body.parent=bus;body.position.y=2;body.material=blue;
  const lower=BABYLON.MeshBuilder.CreateBox("lower band",{width:2.58,height:.5,depth:9.22},scene);lower.parent=bus;lower.position.y=.8;lower.material=material("dark blue","#0b3154");
  const wind=BABYLON.MeshBuilder.CreateBox("front windshield",{width:2.25,height:1,depth:.06},scene);wind.parent=bus;wind.position.set(0,2.8,4.63);wind.material=glass;
  const rear=BABYLON.MeshBuilder.CreateBox("rear glass",{width:2.1,height:.85,depth:.06},scene);rear.parent=bus;rear.position.set(0,2.8,-4.63);rear.material=glass;
  for(const side of [-1,1])for(let i=0;i<5;i++){const w=BABYLON.MeshBuilder.CreateBox("side window",{width:.06,height:.82,depth:1.35},scene);w.parent=bus;w.position.set(side*1.29,2.8,2.7-i*1.35);w.material=glass}
  const wheels=[];
  for(const x of [-1.32,1.32])for(const z of [-2.9,2.9]){const w=BABYLON.MeshBuilder.CreateCylinder("wheel",{diameter:1.1,height:.3,tessellation:24},scene);w.parent=bus;w.rotation.z=Math.PI/2;w.position.set(x,.7,z);w.material=rubber;wheels.push(w)}
  bus.position.set(0,0,-20);
  const follow=new BABYLON.FollowCamera("third person",new BABYLON.Vector3(0,6,-35),scene);follow.lockedTarget=bus;follow.radius=18;follow.heightOffset=6;follow.rotationOffset=180;follow.cameraAcceleration=.04;follow.maxCameraSpeed=12;
  const cockpit=new BABYLON.UniversalCamera("cockpit",new BABYLON.Vector3(0,3,0),scene);cockpit.parent=bus;cockpit.position.set(0,3,2.5);cockpit.minZ=.1;
  scene.activeCamera=follow;follow.attachControl(canvas,true);
  const keys={};window.addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=true;if(["arrowup","arrowdown","arrowleft","arrowright"].includes(e.key.toLowerCase()))e.preventDefault()});
  window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
  let velocity=0,steer=0,inCockpit=false;
  window.addEventListener("keydown",e=>{if(e.repeat)return;if(e.key.toLowerCase()==="c"){inCockpit=!inCockpit;scene.activeCamera=inCockpit?cockpit:follow;if(inCockpit){follow.detachControl();cockpit.attachControl(canvas,true)}else{cockpit.detachControl();follow.attachControl(canvas,true)}document.getElementById("cameraLabel").textContent=inCockpit?"Cockpit":"Third person"}if(e.key.toLowerCase()==="r"){bus.position.set(0,0,-20);bus.rotation.y=0;velocity=0}});
  scene.onBeforeRenderObservable.add(()=>{const dt=Math.min(engine.getDeltaTime()/1000,.04);if(keys.w||keys.arrowup)velocity=Math.min(velocity+5*dt,18);else if(keys.s||keys.arrowdown)velocity=Math.max(velocity-10*dt,-3);else velocity*=Math.pow(.985,dt*60);const d=(keys.a||keys.arrowleft?-1:0)+(keys.d||keys.arrowright?1:0);steer+=(d-steer)*Math.min(1,dt*5);bus.rotation.y+=steer*velocity*.012*dt;bus.position.x+=Math.sin(bus.rotation.y)*velocity*dt;bus.position.z+=Math.cos(bus.rotation.y)*velocity*dt;bus.position.x=Math.max(-4.4,Math.min(4.4,bus.position.x));wheels.forEach(w=>w.rotation.x+=velocity*dt*1.6);document.getElementById("speed").textContent=Math.round(Math.abs(velocity)*5)});
  engine.runRenderLoop(()=>scene.render());window.addEventListener("resize",()=>engine.resize());
})();