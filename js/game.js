(() => {
  const canvas=document.getElementById("renderCanvas");
  const engine=new BABYLON.Engine(canvas,true);
  const scene=new BABYLON.Scene(engine);
  scene.clearColor=new BABYLON.Color4(.58,.75,.86,1);
  new BABYLON.HemisphericLight("sky",new BABYLON.Vector3(0,1,0),scene).intensity=.95;
  const sun=new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.4,-1,.3),scene);
  sun.position.set(20,35,-20);sun.intensity=.72;
  const mat=(name,color,rough=.65)=>{
    const m=new BABYLON.StandardMaterial(name,scene);
    m.diffuseColor=BABYLON.Color3.FromHexString(color);
    m.specularColor=new BABYLON.Color3(.18,.18,.18);
    m.specularPower=48;
    return m;
  };
  const grass=mat("Kerala roadside green","#557b4b"),roadMat=mat("Asphalt","#353c44"),white=mat("Venad ivory body","#e9e9df"),blue=mat("Venad sky blue","#65b6d8"),blueDark=mat("Blue lower edge","#2486b5"),glass=mat("Dark bus glass","#263b43"),glassFront=mat("Front windscreen glass","#7399a5"),rubber=mat("Tyre rubber","#111519"),hub=mat("Wheel hubs","#9da6a8"),black=mat("Black trim","#171e22"),chrome=mat("Aluminium trim","#b8c1c2"),lamp=mat("Headlamp glass","#fff2cf"),amber=mat("Amber indicators","#e5a13b"),red=mat("Rear lamps","#a52b26"),seat=mat("Bus seat upholstery","#425a63"),floorMat=mat("Interior floor","#555b59"),board=mat("Destination board","#17252a");
  const ground=BABYLON.MeshBuilder.CreateGround("green landscape",{width:180,height:500},scene);ground.position.z=100;ground.material=grass;
  const road=BABYLON.MeshBuilder.CreateBox("road",{width:12,height:.12,depth:500},scene);road.position.set(0,.02,100);road.material=roadMat;
  const lineMat=mat("Road markings","#e9dfb7");
  for(let z=-140;z<350;z+=12){const l=BABYLON.MeshBuilder.CreateBox("broken centre line",{width:.14,height:.025,depth:5},scene);l.position.set(0,.09,z);l.material=lineMat}
  for(let i=0;i<24;i++){const side=i%2?-1:1,z=-110+i*19,w=5+(i%3)*2,h=5+(i%4)*1.5;const b=BABYLON.MeshBuilder.CreateBox("roadside building",{width:w,height:h,depth:8},scene);b.position.set(side*(13+w/2),h/2,z);b.material=mat("building "+i,i%2?"#d8d0bd":"#c5d2c1")}
  const bus=new BABYLON.TransformNode("Venad Ashok Leyland bus",scene);
  const box=(name,w,h,d,x,y,z,m,parent=bus)=>{
    const o=BABYLON.MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
    o.parent=parent;o.position.set(x,y,z);o.material=m;return o;
  };
  // Full-length, high-floor Venad-style body. Front is +Z.
  box("main white body",2.58,2.72,10.8,0,2.02,0,white);
  box("blue lower skirt",2.62,.48,10.84,0,.82,0,blue);
  box("blue front lower fascia",2.6,.5,.12,0,.83,5.43,blue);
  box("blue rear lower fascia",2.6,.5,.12,0,.83,-5.43,blue);
  box("roof cap",2.58,.12,10.72,0,3.43,0,white);
  // Front one-piece windscreen with slim black rubber surround.
  box("front windscreen surround",2.34,1.36,.095,0,2.82,5.47,black);
  box("single-piece front windshield",2.23,1.25,.045,0,2.84,5.535,glassFront);
  box("front windscreen lower seal",2.28,.055,.07,0,2.16,5.55,black);
  // Rear glass and rear destination/route panel.
  box("rear window surround",2.12,1.02,.08,0,2.83,-5.47,black);
  box("rear window",2.02,.91,.04,0,2.83,-5.525,glass);
  box("rear route panel",1.45,.25,.07,0,3.39,-5.49,board);
  // Front destination header, KSRTC lettering panel and authentic-looking grille.
  box("front destination board",1.95,.25,.08,0,3.39,5.49,board);
  box("front KSRTC blue panel",1.95,.34,.07,0,3.19,5.52,blue);
  box("front grille backing",1.04,.64,.10,0,1.62,5.51,black);
  for(let i=0;i<7;i++)box("horizontal grille louvre "+i,1.0,.045,.045,0,1.38+i*.08,5.58,chrome);
  box("grille centre badge",.22,.22,.07,0,1.62,5.63,hub);
  box("ASHOK LEYLAND nameplate",.9,.13,.05,0,2.02,5.58,black);
  box("front registration plate",.78,.22,.07,0,.98,5.58,mat("Yellow registration plate","#e8c33c"));
  // Twin round headlamps, indicators and bumper.
  for(const x of [-.96,.96]){
    const head=BABYLON.MeshBuilder.CreateCylinder("round headlamp bezel",{diameter:.43,height:.09,tessellation:32},scene);
    head.parent=bus;head.rotation.x=Math.PI/2;head.position.set(x,1.42,5.55);head.material=black;
    const lens=BABYLON.MeshBuilder.CreateCylinder("round headlamp lens",{diameter:.32,height:.095,tessellation:32},scene);
    lens.parent=bus;lens.rotation.x=Math.PI/2;lens.position.set(x,1.42,5.61);lens.material=lamp;
    box("front amber indicator",.2,.16,.07,x*1.12,1.42,5.57,amber);
  }
  box("front bumper",2.65,.27,.22,0,.64,5.52,blueDark);
  box("bumper silver edge",2.56,.055,.035,0,.51,5.65,chrome);
  // Windscreen wipers are thin angled bars across the lower glass.
  for(const x of [-.48,.48]){
    const w=box("windscreen wiper",.055,.72,.035,x,2.28,5.59,black);
    w.rotation.z=x<0?-.2:.2;
  }
  // Side windows: long dark glazing, black dividers and lower body stripe.
  for(const side of [-1,1]){
    box("long blue side belt",.045,.13,10.45,side*1.305,1.72,0,blueDark);
    for(let i=0;i<8;i++){
      const z=4.55-i*1.18;
      box("side window rubber frame",.065,1.17,1.06,side*1.315,2.78,z,black);
      box("dark passenger window",.035,1.08,.98,side*1.355,2.79,z,glass);
      box("window vertical divider",.045,1.08,.045,side*1.38,2.79,z,chrome);
    }
    box("side window lower rail",.06,.065,9.7,side*1.34,2.18,0,black);
    // Side mirrors and arms.
    const arm=box("mirror support arm",.065,.07,.9,side*1.49,3.04,4.62,black);arm.rotation.y=side*.22;
    box("mirror housing",.16,.42,.25,side*1.67,3.14,4.2,black);
    box("mirror reflective glass",.035,.33,.19,side*1.765,3.14,4.2,glassFront);
  }
  // Two passenger doors, reflecting the two-door Venad layout.
  for(const [idx,z] of [[0,3.05],[1,-3.72]]){
    const side=-1;
    box("door dark frame "+idx,.09,2.15,1.02,side*1.34,1.92,z,black);
    box("door upper glass "+idx,.045,1.18,.88,side*1.405,2.27,z,glass);
    box("door lower blue panel "+idx,.05,.63,.9,side*1.405,1.34,z,blue);
    box("door centre rail "+idx,.055,.06,.9,side*1.43,1.63,z,chrome);
    box("door vertical handle "+idx,.04,.36,.035,side*1.45,1.83,z+.34,chrome);
    // Visible low entry step.
    box("entry step "+idx,.68,.12,.94,side*1.05,.46,z,chrome);
  }
  // Luggage/service hatches on the opposite side.
  for(let i=0;i<4;i++){
    const z=3.15-i*2.05;
    box("lower service hatch "+i,.045,.43,1.7,1.315,1.12,z,blueDark);
    box("service hatch seam "+i,.035,.025,1.58,1.345,1.34,z,chrome);
  }
  // Wheel arches are upper semicircular mouldings, not full rings.
  const wheels=[];
  for(const side of [-1,1]){
    for(const axleZ of [-3.55,3.55]){
      const path=[];
      for(let i=0;i<=20;i++){
        const a=Math.PI*i/20;
        path.push(new BABYLON.Vector3(side*1.34,.72+.69*Math.sin(a),axleZ+.69*Math.cos(a)));
      }
      const arch=BABYLON.MeshBuilder.CreateTube("upper semicircle wheel arch",{path,radius:.055,tessellation:8},scene);
      arch.parent=bus;arch.material=black;
    }
  }
  for(const x of [-1.34,1.34]){
    for(const z of [-3.55,3.55]){
      const tyre=BABYLON.MeshBuilder.CreateCylinder("bus tyre",{diameter:1.18,height:.34,tessellation:32},scene);
      tyre.parent=bus;tyre.rotation.z=Math.PI/2;tyre.position.set(x,.7,z);tyre.material=rubber;wheels.push(tyre);
      const rim=BABYLON.MeshBuilder.CreateCylinder("wheel rim",{diameter:.62,height:.36,tessellation:32},scene);
      rim.parent=bus;rim.rotation.z=Math.PI/2;rim.position.set(x*1.015,.7,z);rim.material=hub;
      const cap=BABYLON.MeshBuilder.CreateCylinder("wheel hub cap",{diameter:.22,height:.38,tessellation:24},scene);
      cap.parent=bus;cap.rotation.z=Math.PI/2;cap.position.set(x*1.025,.7,z);cap.material=chrome;
    }
  }
  // Rear tail lamps, number plate, and simple bumper.
  for(const x of [-.94,.94]){
    box("rear lamp housing",.32,.68,.08,x,1.48,-5.51,black);
    box("rear red lamp",.23,.28,.05,x,1.63,-5.57,red);
    box("rear amber lamp",.23,.17,.05,x,1.39,-5.57,amber);
    box("rear reverse lamp",.23,.12,.05,x,1.2,-5.57,lamp);
  }
  box("rear bumper",2.55,.22,.2,0,.62,-5.52,blueDark);
  // Interior visible through side windows: floor, aisle, paired passenger seats and rails.
  const interior=new BABYLON.TransformNode("bus interior",scene);interior.parent=bus;
  box("interior floor",2.22,.12,9.95,0,1.02,0,floorMat,interior);
  box("front driver partition",2.1,1.5,.08,0,2.0,4.48,black,interior);
  box("driver seat base",.62,.25,.62,-.62,1.5,4.05,seat,interior);
  box("driver seat back",.62,.9,.2,-.62,2.02,4.28,seat,interior);
  for(let row=0;row<10;row++){
    const z=3.25-row*.83;
    for(const x of [-.66,.66]){
      box("passenger seat cushion",.55,.18,.55,x,1.43,z,seat,interior);
      box("passenger seat back",.55,.72,.16,x,1.83,z-.2,seat,interior);
      box("seat support",.07,.38,.07,x,1.2,z,chrome,interior);
    }
  }
  for(let i=0;i<7;i++){
    const z=3.55-i*1.25;
    const pole=BABYLON.MeshBuilder.CreateCylinder("standing grab pole",{diameter:.045,height:1.45,tessellation:12},scene);
    pole.parent=interior;pole.position.set(.02,2.0,z);pole.material=chrome;
  }
  // Cockpit details.
  box("dashboard",1.65,.2,.62,0,2.03,4.7,black,interior);
  box("instrument cluster",.62,.16,.06,0,2.18,4.98,chrome,interior);
  const steering=BABYLON.MeshBuilder.CreateTorus("steering wheel",{diameter:.48,thickness:.045,tessellation:24},scene);
  steering.parent=interior;steering.position.set(-.62,2.18,4.78);steering.rotation.x=Math.PI/2;steering.material=black;
  // Small livery details and visible text decals are represented as simple raised panels.
  box("VENAD lettering plate",.78,.18,.045,0,2.18,5.57,white);
  box("KSRTC front lettering strip",1.75,.22,.035,0,3.19,5.58,blue);
  // Small side route/branding panels.
  for(const side of [-1,1]){
    box("side VENAD branding panel",.035,.42,1.12,side*1.39,1.98,-.15,blueDark);
    box("side white logo panel",.035,.26,.72,side*1.415,2.0,-.15,white);
  }
  bus.position.set(0,0,-20);

  // Four camera views: chase, smooth follow, orbit and cockpit.
  const fixedCamera=new BABYLON.UniversalCamera("fixed chase",new BABYLON.Vector3(0,6,-18),scene);
  fixedCamera.parent=bus;fixedCamera.minZ=.1;
  const smoothCamera=new BABYLON.UniversalCamera("smooth follow",new BABYLON.Vector3(0,7,-30),scene);
  smoothCamera.minZ=.1;
  const freeCamera=new BABYLON.ArcRotateCamera("free camera",Math.PI/2,1.12,22,new BABYLON.Vector3(0,2,0),scene);
  freeCamera.lowerRadiusLimit=7;freeCamera.upperRadiusLimit=65;freeCamera.wheelPrecision=35;freeCamera.panningSensibility=70;
  const cockpit=new BABYLON.UniversalCamera("cockpit",new BABYLON.Vector3(0,2.65,4.2),scene);
  cockpit.parent=bus;cockpit.minZ=.1;
  const cameraModes=[{name:"Fixed chase",camera:fixedCamera},{name:"Smooth follow",camera:smoothCamera},{name:"Free camera",camera:freeCamera},{name:"Cockpit",camera:cockpit}];
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
    keys[k]=true;if(e.repeat)return;
    if(k==="c"){cameraIndex=(cameraIndex+1)%cameraModes.length;setCamera()}
    if(k==="r"){bus.position.set(0,0,-20);bus.rotation.y=0;velocity=0}
  });
  window.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
  let velocity=0,steer=0;
  const smoothPosition=new BABYLON.Vector3(0,7,-30),lookTarget=new BABYLON.Vector3(0,2,0);
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
    const heading=bus.rotation.y;
    const desired=new BABYLON.Vector3(bus.position.x-Math.sin(heading)*25,bus.position.y+7,bus.position.z-Math.cos(heading)*25);
    BABYLON.Vector3.LerpToRef(smoothPosition,desired,1-Math.exp(-3.2*dt),smoothPosition);
    smoothCamera.position.copyFrom(smoothPosition);
    const target=new BABYLON.Vector3(bus.position.x,bus.position.y+2.1,bus.position.z);
    BABYLON.Vector3.LerpToRef(lookTarget,target,1-Math.exp(-5*dt),lookTarget);
    smoothCamera.setTarget(lookTarget);freeCamera.target.copyFrom(target);
    document.getElementById("speed").textContent=Math.round(Math.abs(velocity)*5);
  });
  engine.runRenderLoop(()=>scene.render());
  window.addEventListener("resize",()=>engine.resize());
})();