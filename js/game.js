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
  // Full-length Venad high-floor body. Front is +Z.
  box("main ivory body shell",2.58,2.66,10.8,0,2.03,0,white);
  box("continuous sky-blue lower band",2.62,.38,10.84,0,.82,0,blue);
  box("front blue bumper fascia",2.62,.34,.16,0,.79,5.43,blue);
  box("rear blue bumper fascia",2.62,.34,.16,0,.79,-5.43,blue);
  box("roof crown",2.58,.14,10.72,0,3.43,0,white);
  for(const side of [-1,1]){
    box("roof edge rain gutter",.045,.045,10.5,side*1.285,3.34,0,chrome);
    box("thin blue side waist stripe",.035,.095,10.55,side*1.305,1.72,0,blueDark);
  }
  // Wide single-piece Venad windscreen, slightly reclined like the reference.
  const screenFrame=box("single windscreen rubber surround",2.34,1.39,.095,0,2.82,5.47,black);
  screenFrame.rotation.x=-.07;
  const windscreen=box("single-piece panoramic windshield",2.23,1.27,.045,0,2.84,5.535,glassFront);
  windscreen.rotation.x=-.07;
  box("windscreen lower rubber seal",2.28,.055,.07,0,2.16,5.55,black);
  const frontTextTex=new BABYLON.DynamicTexture("KSRTC windshield lettering",{width:1024,height:256},scene,false);
  const frontTextCtx=frontTextTex.getContext();
  frontTextCtx.clearRect(0,0,1024,256);
  frontTextCtx.fillStyle="#e9f2f4";frontTextCtx.fillRect(0,0,1024,256);
  frontTextCtx.font="bold 112px Arial";frontTextCtx.fillStyle="#1676b5";frontTextCtx.fillText("KSRTC",38,145);
  frontTextCtx.font="bold 48px Arial";frontTextCtx.fillStyle="#9b3c42";frontTextCtx.fillText("VENAD",700,140);
  frontTextTex.update();
  const frontTextMat=new BABYLON.StandardMaterial("windshield lettering material",scene);
  frontTextMat.diffuseTexture=frontTextTex;frontTextMat.emissiveColor=new BABYLON.Color3(.18,.18,.18);frontTextMat.backFaceCulling=false;
  box("KSRTC windshield lettering panel",1.94,.34,.025,0,3.28,5.565,frontTextMat);
  // Rear glass and rear destination/route panel.
  box("rear window surround",2.12,1.02,.08,0,2.83,-5.47,black);
  box("rear window",2.02,.91,.04,0,2.83,-5.525,glass);
  box("rear route panel",1.45,.25,.07,0,3.39,-5.49,board);
  // Traditional squared front face with broad ribbed Leyland grille.
  box("front destination display recess",1.68,.22,.055,0,3.38,5.49,black);
  box("front grille outer surround",1.18,.72,.09,0,1.64,5.52,chrome);
  box("front grille dark inset",1.08,.62,.045,0,1.64,5.575,black);
  for(let i=0;i<8;i++)box("horizontal grille rib "+i,1.02,.042,.035,0,1.37+i*.077,5.61,chrome);
  box("grille centre emblem mount",.22,.22,.055,0,1.64,5.64,hub);
  const badgeTex=new BABYLON.DynamicTexture("Ashok Leyland nameplate texture",{width:512,height:128},scene,false);
  const badgeCtx=badgeTex.getContext();
  badgeCtx.fillStyle="#e8e9e5";badgeCtx.fillRect(0,0,512,128);
  badgeCtx.fillStyle="#17252a";badgeCtx.font="bold 54px Arial";badgeCtx.textAlign="center";badgeCtx.fillText("ASHOK LEYLAND",256,84);badgeTex.update();
  const badgeMat=new BABYLON.StandardMaterial("Ashok Leyland nameplate material",scene);
  badgeTex.vScale=-1;badgeTex.vOffset=1;
  badgeMat.diffuseTexture=badgeTex;badgeMat.emissiveColor=new BABYLON.Color3(.12,.12,.12);
  box("ASHOK LEYLAND nameplate",1.18,.2,.035,0,2.08,5.585,badgeMat);
  box("front registration plate",.78,.2,.06,0,.98,5.58,mat("Yellow registration plate","#e8c33c"));
  // Two round lamps set into the lower front corners, as in the supplied photo.
  for(const x of [-.99,.99]){
    const bezel=BABYLON.MeshBuilder.CreateCylinder("round headlamp black bezel",{diameter:.43,height:.09,tessellation:32},scene);
    bezel.parent=bus;bezel.rotation.x=Math.PI/2;bezel.position.set(x,1.42,5.55);bezel.material=black;
    const lens=BABYLON.MeshBuilder.CreateCylinder("round headlamp lens",{diameter:.32,height:.095,tessellation:32},scene);
    lens.parent=bus;lens.rotation.x=Math.PI/2;lens.position.set(x,1.42,5.61);lens.material=lamp;
    const indicator=box("small amber indicator",.19,.14,.07,x*1.12,1.17,5.57,amber);
  }
  box("full-width blue front bumper",2.65,.27,.22,0,.64,5.52,blueDark);
  box("bumper narrow silver edge",2.56,.045,.035,0,.50,5.65,chrome);
  // One driver's-side wiper only. Pivot at lower glass edge, blade angled upward.
  const wiperPivot=BABYLON.MeshBuilder.CreateCylinder("single driver-side wiper pivot",{diameter:.075,height:.045,tessellation:20},scene);
  wiperPivot.parent=bus;wiperPivot.rotation.x=Math.PI/2;
  wiperPivot.position.set(.43,2.23,5.585);wiperPivot.material=black;
  const wiperArm=box("single windscreen wiper arm",.035,.53,.028,.32,2.43,5.61,black);
  wiperArm.rotation.z=.42;
  const wiperBlade=box("single windscreen wiper blade",.045,.78,.035,.12,2.58,5.625,black);
  wiperBlade.rotation.z=.42;
  // Tall rectangular passenger windows with dark rubber surrounds and curtains.
  for(const side of [-1,1]){
    for(let i=0;i<7;i++){
      const z=4.25-i*1.35;
      box("side window black rubber surround",.065,1.16,1.20,side*1.315,2.78,z,black);
      box("side passenger glazing",.035,1.07,1.11,side*1.355,2.79,z,glass);
      box("side window centre divider",.04,1.08,.035,side*1.38,2.79,z,black);
      for(const curtainZ of [z-.48,z+.48]){
        box("interior window curtain",.025,.96,.045,side*1.325,2.79,curtainZ,seat);
      }
    }
    box("side window lower rubber rail",.055,.065,9.65,side*1.34,2.18,0,black);
    box("side blue belt stripe",.04,.105,10.5,side*1.35,1.72,0,blueDark);
    const mirrorArm=box("front mirror support arm",.065,.07,.9,side*1.49,3.04,4.62,black);mirrorArm.rotation.y=side*.22;
    box("large rectangular side mirror housing",.16,.42,.25,side*1.67,3.14,4.2,black);
    box("side mirror glass",.035,.33,.19,side*1.765,3.14,4.2,glassFront);
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
  // Plain lower side panels: this older high-floor Venad body has no modern coach luggage doors.
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
  // Right-hand-drive cockpit: driver position is on the bus's right side.
  box("driver seat base",.62,.25,.62,.62,1.5,4.05,seat,interior);
  box("driver seat back",.62,.9,.2,.62,2.02,4.28,seat,interior);
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
  box("driver instrument cluster",.62,.16,.06,.62,2.18,4.98,chrome,interior);
  const steering=BABYLON.MeshBuilder.CreateTorus("right-hand-drive steering wheel",{diameter:.48,thickness:.045,tessellation:24},scene);
  steering.parent=interior;steering.position.set(.62,2.18,4.78);steering.rotation.x=Math.PI/2;steering.material=black;
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
  const cockpit=new BABYLON.UniversalCamera("cockpit",new BABYLON.Vector3(.62,2.65,4.2),scene);
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