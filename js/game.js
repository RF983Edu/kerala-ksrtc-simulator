(() => {
  const canvas=document.getElementById("renderCanvas");
  const engine=new BABYLON.Engine(canvas,true);
  const scene=new BABYLON.Scene(engine);
  scene.clearColor=new BABYLON.Color4(.56,.73,.85,1);
  new BABYLON.HemisphericLight("sky",new BABYLON.Vector3(0,1,0),scene).intensity=.9;
  const sun=new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.4,-1,.3),scene);
  sun.position.set(20,35,-20);sun.intensity=.7;
  const material=(name,color)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);return m};
  const grass=material("grass","#557b4b"),roadMat=material("road","#353c44"),blue=material("blue bus placeholder","#1764a3"),glass=material("glass","#9ecbd9"),rubber=material("rubber","#171b20"),white=material("building","#d9d3c6"),yellow=material("markings","#f3e8c8");
  const ground=BABYLON.MeshBuilder.CreateGround("ground",{width:180,height:500},scene);ground.position.z=100;ground.material=grass;
  const road=BABYLON.MeshBuilder.CreateBox("road",{width:12,height:.12,depth:500},scene);road.position.set(0,.02,100);road.material=roadMat;
  for(let z=-140;z<350;z+=12){const l=BABYLON.MeshBuilder.CreateBox("lane line",{width:.14,height:.025,depth:5},scene);l.position.set(0,.09,z);l.material=yellow}
  for(let i=0;i<24;i++){const side=i%2?-1:1,z=-110+i*19,w=5+(i%3)*2,h=5+(i%4)*1.5;const b=BABYLON.MeshBuilder.CreateBox("placeholder building",{width:w,height:h,depth:8},scene);b.position.set(side*(13+w/2),h/2,z);b.material=white}
  const bus=new BABYLON.TransformNode("bus",scene);
  const body=BABYLON.MeshBuilder.CreateBox("bus body",{width:2.55,height:3,depth:10.8},scene);body.parent=bus;body.position.y=2;body.material=blue;
  const lower=BABYLON.MeshBuilder.CreateBox("lower band",{width:2.58,height:.5,depth:10.82},scene);lower.parent=bus;lower.position.y=.8;lower.material=material("dark blue","#0b3154");
  const wind=BABYLON.MeshBuilder.CreateBox("front windshield",{width:2.25,height:1,depth:.06},scene);wind.parent=bus;wind.position.set(0,2.8,5.43);wind.material=glass;
  const rear=BABYLON.MeshBuilder.CreateBox("rear glass",{width:2.1,height:.85,depth:.06},scene);rear.parent=bus;rear.position.set(0,2.8,-5.43);rear.material=glass;
  for(const side of [-1,1])for(let i=0;i<6;i++){const w=BABYLON.MeshBuilder.CreateBox("side window",{width:.06,height:.82,depth:1.35},scene);w.parent=bus;w.position.set(side*1.29,2.8,3.35-i*1.34);w.material=glass}
  const wheels=[];
  for(const x of [-1.32,1.32])for(const z of [-3.45,3.45]){const w=BABYLON.MeshBuilder.CreateCylinder("wheel",{diameter:1.1,height:.3,tessellation:24},scene);w.parent=bus;w.rotation.z=Math.PI/2;w.position.set(x,.7,z);w.material=rubber;wheels.push(w)}
  bus.position.set(0,0,-20);

  // Four stable views: fixed chase, smooth chase, free orbit and cockpit.
  const fixedCamera=new BABYLON.UniversalCamera("fixed chase",new BABYLON.Vector3(0,6,-18),scene);
  fixedCamera.parent=bus;fixedCamera.minZ=.1;
  const smoothCamera=new BABYLON.UniversalCamera("smooth follow",new BABYLON.Vector3(0,6,-30),scene);
  smoothCamera.minZ=.1;
  const freeCamera=new BABYLON.ArcRotateCamera("free camera",-Math.PI/2,1.12,22,new BABYLON.Vector3(0,2,0),scene);
  freeCamera.lowerRadiusLimit=7;freeCamera.upperRadiusLimit=65;freeCamera.wheelPrecision=35;freeCamera.panningSensibility=70;
  const cockpit=new BABYLON.UniversalCamera("cockpit",new BABYLON.Vector3(0,3,2.5),scene);
  cockpit.parent=bus;cockpit.minZ=.1;
  const cameraModes=[
    {name:"Fixed chase",camera:fixedCamera},
    {name:"Smooth follow",camera:smoothCamera},
    {name:"Free camera",camera:freeCamera},
    {name:"Cockpit",camera:cockpit}
  ];
  let cameraIndex=0;
  const setCamera=()=>{
    const mode=cameraModes[cameraIndex];
    [fixedCamera,smoothCamera,freeCamera,cockpit].forEach(c=>c.detachControl());
    scene.activeCamera=mode.camera;
    if(mode.camera===freeCamera)freeCamera.attachControl(canvas,true);
    document.getElementById("cameraLabel").textContent=mode.name;
  };
  setCamera();
  const keys={};
  window.addEventListener("keydown",e=>{
    const k=e.key.toLowerCase();
    if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
    keys[k]=true;
    if(e.repeat)return;
    if(k==="c"){cameraIndex=(cameraIndex+1)%cameraModes.length;setCamera()}
    if(k==="r"){bus.position.set(0,0,-20);bus.rotation.y=0;velocity=0}
  });
  window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
  let velocity=0,steer=0;
  const smoothPosition=new BABYLON.Vector3(0,6,-30);
  const lookTarget=new BABYLON.Vector3(0,2,0);
  scene.onBeforeRenderObservable.add(()=>{
    const dt=Math.min(engine.getDeltaTime()/1000,.04);
    if(keys.w||keys.arrowup)velocity=Math.min(velocity+5*dt,18);
    else if(keys.s||keys.arrowdown)velocity=Math.max(velocity-10*dt,-3);
    else velocity*=Math.pow(.985,dt*60);
    const d=(keys.a||keys.arrowleft?-1:0)+(keys.d||keys.arrowright?1:0);
    steer+=(d-steer)*Math.min(1,dt*5);
    bus.rotation.y+=steer*velocity*.012*dt;
    bus.position.x+=Math.sin(bus.rotation.y)*velocity*dt;
    bus.position.z+=Math.cos(bus.rotation.y)*velocity*dt;
    bus.position.x=Math.max(-4.4,Math.min(4.4,bus.position.x));
    wheels.forEach(w=>w.rotation.x+=velocity*dt*1.6);
    // Smooth follow camera eases toward a stable point behind the bus.
    const heading=bus.rotation.y;
    const desired=new BABYLON.Vector3(
      bus.position.x-Math.sin(heading)*25,
      bus.position.y+7,
      bus.position.z-Math.cos(heading)*25
    );
    const blend=1-Math.exp(-3.2*dt);
    BABYLON.Vector3.LerpToRef(smoothPosition,desired,blend,smoothPosition);
    smoothCamera.position.copyFrom(smoothPosition);
    const target=new BABYLON.Vector3(bus.position.x,bus.position.y+2.1,bus.position.z);
    BABYLON.Vector3.LerpToRef(lookTarget,target,1-Math.exp(-5*dt),lookTarget);
    smoothCamera.setTarget(lookTarget);
    freeCamera.target.copyFrom(target);
    document.getElementById("speed").textContent=Math.round(Math.abs(velocity)*5);
  });
  engine.runRenderLoop(()=>scene.render());
  window.addEventListener("resize",()=>engine.resize());
})();