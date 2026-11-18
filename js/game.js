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
  // Side body: passenger door, window framing, livery stripe and service panels.
  const sideWhite=material("KSRTC white side stripe","#f0f1e9");
  const doorFrame=material("passenger door frame","#182a38");
  const doorGlass=material("passenger door glass","#8dbdce");
  const panelBlue=material("side access panels","#104d80");
  const sideTrim=material("side trim","#c4cbd0");
  for(const side of [-1,1]){
    // Continuous white belt line below the passenger windows.
    const stripe=BABYLON.MeshBuilder.CreateBox("white KSRTC side belt",{width:.045,height:.16,depth:10.55},scene);
    stripe.parent=bus;stripe.position.set(side*1.305,1.72,0);stripe.material=sideWhite;
    // Window pillars and lower window rails make the glazing read as separate panes.
    for(let i=0;i<=6;i++){
      const z=3.98-i*1.34;
      const pillar=BABYLON.MeshBuilder.CreateBox("side window pillar",{width:.075,height:.94,depth:.075},scene);
      pillar.parent=bus;pillar.position.set(side*1.315,2.8,z);pillar.material=doorFrame;
    }
    const rail=BABYLON.MeshBuilder.CreateBox("side window lower rail",{width:.07,height:.07,depth:8.2},scene);
    rail.parent=bus;rail.position.set(side*1.315,2.34,0);rail.material=doorFrame;
  }
  // Passenger entrance on the left side, toward the front of the bus.
  const entrySide=-1;
  const doorOuter=BABYLON.MeshBuilder.CreateBox("passenger entrance surround",{width:.09,height:2.22,depth:1.05},scene);
  doorOuter.parent=bus;doorOuter.position.set(entrySide*1.32,1.94,3.15);doorOuter.material=doorFrame;
  const doorPane=BABYLON.MeshBuilder.CreateBox("passenger door glass",{width:.045,height:1.38,depth:.88},scene);
  doorPane.parent=bus;doorPane.position.set(entrySide*1.375,2.28,3.15);doorPane.material=doorGlass;
  const doorLower=BABYLON.MeshBuilder.CreateBox("passenger door lower panel",{width:.05,height:.48,depth:.9},scene);
  doorLower.parent=bus;doorLower.position.set(entrySide*1.375,1.34,3.15);doorLower.material=panelBlue;
  for(const z of [-3.35,-1.95]){
    const arch=BABYLON.MeshBuilder.CreateTorus("wheel arch trim",{diameter:1.48,thickness:.09,tessellation:32},scene);
    arch.parent=bus;arch.rotation.y=Math.PI/2;arch.position.set(1.305,.72,z);arch.material=doorFrame;
    const arch2=BABYLON.MeshBuilder.CreateTorus("wheel arch trim opposite",{diameter:1.48,thickness:.09,tessellation:32},scene);
    arch2.parent=bus;arch2.rotation.y=Math.PI/2;arch2.position.set(-1.305,.72,z);arch2.material=doorFrame;
  }
  // Luggage/service compartment doors on the opposite lower side.
  for(let i=0;i<3;i++){
    const z=2.45-i*2.35;
    const hatch=BABYLON.MeshBuilder.CreateBox("luggage compartment panel",{width:.055,height:.55,depth:1.95},scene);
    hatch.parent=bus;hatch.position.set(1.315,.99,z);hatch.material=panelBlue;
    const seam=BABYLON.MeshBuilder.CreateBox("luggage panel seam",{width:.025,height:.035,depth:1.82},scene);
    seam.parent=bus;seam.position.set(1.35,1.27,z);seam.material=sideTrim;
  }
  // Front fascia details: an early KSRTC-style blockout, to be refined against photos.
  const chrome=material("front trim","#b9c4c9");
  const black=material("grille","#202a32");
  const lamp=material("headlamp","#fff3c4");
  const amber=material("indicator","#e99a35");
  const board=material("destination board","#17212b");
  const addFrontPart=(name,w,h,d,x,y,z,mat)=>{
    const p=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
    p.parent=bus;p.position.set(x,y,z);p.material=mat;return p;
  };
  // Destination display panel and front windscreen wipers.
  addFrontPart("destination display",1.85,.28,.09,0,3.43,5.72,board);
  addFrontPart("display lower trim",1.92,.07,.11,0,3.26,5.72,chrome);
  for(const x of [-.62,.62]){
    const wiper=addFrontPart("windscreen wiper",.72,.045,.045,x,2.25,5.72,black);
    wiper.rotation.z=x<0?-.12:.12;
  }
  // Grille, paired headlights, indicators and bumper.
  addFrontPart("front grille",.92,.48,.12,0,1.65,5.72,black);
  addFrontPart("grille centre bar",.08,.43,.035,0,1.65,5.81,chrome);
  for(const x of [-.91,.91]){
    addFrontPart("headlight housing",.48,.34,.13,x,1.34,5.72,black);
    addFrontPart("headlight lens",.36,.22,.05,x,1.35,5.84,lamp);
    addFrontPart("front indicator",.25,.17,.12,x*1.17,1.34,5.72,amber);
  }
  addFrontPart("front bumper",2.62,.28,.22,0,.66,5.72,chrome);
  addFrontPart("bumper centre",.72,.12,.04,0,.66,5.86,black);
  // Mirror arms and mirror housings on both sides.
  for(const side of [-1,1]){
    const arm=addFrontPart("mirror arm",.07,.07,.85,side*1.48,3.12,4.72,black);
    arm.rotation.y=side*.18;
    addFrontPart("side mirror",.18,.48,.16,side*1.76,3.2,4.34,black);
    addFrontPart("mirror glass",.035,.34,.11,side*1.86,3.2,4.34,glass);
  }
  const wheels=[];
  for(const x of [-1.32,1.32])for(const z of [-3.45,3.45]){const w=BABYLON.MeshBuilder.CreateCylinder("wheel",{diameter:1.1,height:.3,tessellation:24},scene);w.parent=bus;w.rotation.z=Math.PI/2;w.position.set(x,.7,z);w.material=rubber;wheels.push(w)}
  bus.position.set(0,0,-20);

  // Four stable views: fixed chase, smooth chase, free orbit and cockpit.
  const fixedCamera=new BABYLON.UniversalCamera("fixed chase",new BABYLON.Vector3(0,6,-18),scene);
  fixedCamera.parent=bus;fixedCamera.minZ=.1;
  const smoothCamera=new BABYLON.UniversalCamera("smooth follow",new BABYLON.Vector3(0,6,-30),scene);
  smoothCamera.minZ=.1;
  const freeCamera=new BABYLON.ArcRotateCamera("free camera",Math.PI/2,1.12,22,new BABYLON.Vector3(0,2,0),scene);
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