(() => {
  const canvas=document.getElementById("renderCanvas");
  const engine=new BABYLON.Engine(canvas,true);
  const scene=new BABYLON.Scene(engine);
  scene.clearColor=new BABYLON.Color4(.58,.75,.86,1);
  scene.fogMode=BABYLON.Scene.FOGMODE_EXP2;
  scene.fogColor=new BABYLON.Color3(.58,.72,.78);
  scene.fogDensity=.0022;
  scene.imageProcessingConfiguration.toneMappingEnabled=true;
  scene.imageProcessingConfiguration.toneMappingType=BABYLON.ImageProcessingConfiguration.TONEMAPPING_ACES;
  scene.imageProcessingConfiguration.exposure=1.05;
  scene.imageProcessingConfiguration.contrast=1.12;

  new BABYLON.HemisphericLight("sky",new BABYLON.Vector3(0,1,0),scene).intensity=.95;
  const sun=new BABYLON.DirectionalLight("sun",new BABYLON.Vector3(-.4,-1,.3),scene);
  sun.position.set(20,35,-20);sun.intensity=.72;
  sun.shadowMinZ=1;sun.shadowMaxZ=90;
  const shadows=new BABYLON.ShadowGenerator(2048,sun);
  shadows.useBlurExponentialShadowMap=true;shadows.blurKernel=24;
  shadows.setDarkness(.28);

  // Babylon plane UVs need a horizontal texture flip for legible exterior decals.
  const makeTextReadable=(texture)=>{texture.uScale=-1;texture.uOffset=1;return texture;};
  const mat=(name,color,rough=.65)=>{
    const m=new BABYLON.StandardMaterial(name,scene);
    m.diffuseColor=BABYLON.Color3.FromHexString(color);
    m.specularColor=new BABYLON.Color3(.18,.18,.18);
    m.specularPower=48;
    return m;
  };
  const grass=mat("Kerala roadside green","#557b4b"),roadMat=mat("Asphalt","#353c44"),white=mat("Venad ivory body","#e9e9df"),blue=mat("Venad sky blue","#65b6d8"),blueDark=mat("Blue lower edge","#2486b5"),glass=mat("Dark bus glass","#263b43"),glassFront=mat("Front windscreen glass","#7399a5"),rubber=mat("Tyre rubber","#111519"),hub=mat("Wheel hubs","#9da6a8"),black=mat("Black trim","#171e22"),chrome=mat("Aluminium trim","#b8c1c2"),lamp=mat("Headlamp glass","#fff2cf"),amber=mat("Amber indicators","#e5a13b"),red=mat("Rear lamps","#a52b26"),seat=mat("Bus seat upholstery","#425a63"),floorMat=mat("Interior floor","#555b59"),board=mat("Destination board","#17252a");
  const ground=BABYLON.MeshBuilder.CreateGround("green landscape",{width:180,height:500},scene);ground.position.z=100;ground.material=grass;
  ground.receiveShadows=true;
  const shoulderMat=mat("Road shoulder gravel","#77796f");
  const shoulderEdgeMat=mat("Road edge paint","#e9dfb7");
  for(const side of [-1,1]){
    const shoulder=BABYLON.MeshBuilder.CreateBox("road shoulder",{width:1.25,height:.08,depth:500},scene);
    shoulder.position.set(side*6.55,.015,100);shoulder.material=shoulderMat;
    const edge=BABYLON.MeshBuilder.CreateBox("road edge line",{width:.12,height:.025,depth:500},scene);
    edge.position.set(side*5.82,.095,100);edge.material=shoulderEdgeMat;
  }
  // Layered roadside trees create a Kerala roadside silhouette without distracting from the bus.
  const trunkMat=mat("Tree trunks","#554538"),leafMats=[mat("Foliage deep green","#244b35"),mat("Foliage mid green","#356747"),mat("Foliage light green","#557c4b")];
  for(let i=0;i<30;i++){
    const side=i%2?-1:1,z=-130+i*16,x=side*(10+(i%4)*2);
    const trunk=BABYLON.MeshBuilder.CreateCylinder("roadside tree trunk",{height:3.2+(i%3),diameter:.28,tessellation:8},scene);
    trunk.position.set(x,1.6,z);trunk.material=trunkMat;
    for(let j=0;j<3;j++){
      const crown=BABYLON.MeshBuilder.CreateSphere("roadside tree crown",{diameter:3.2+(j%2)*.8,segments:8},scene);
      crown.position.set(x+(j-1)*.8,3.8+(j%2)*.65,z+(j%2)*.5);crown.material=leafMats[(i+j)%leafMats.length];
    }
  }

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
  for(const x of [-1.18,1.18]){
    const bumperEnd=BABYLON.MeshBuilder.CreateCylinder("rounded blue bumper end",{height:.24,diameter:.34,tessellation:20},scene);
    bumperEnd.parent=bus;bumperEnd.rotation.z=Math.PI/2;bumperEnd.position.set(x,.78,5.47);bumperEnd.material=blueDark;
  }

  box("rear blue bumper fascia",2.62,.34,.16,0,.79,-5.43,blue);
  box("roof crown",2.58,.14,10.72,0,3.43,0,white);
  // Softened coach-body corners and continuous roof edge mouldings.
  for(const x of [-1.22,1.22]){
    for(const z of [-5.28,5.28]){
      const corner=BABYLON.MeshBuilder.CreateCylinder("rounded body corner pillar",{height:2.58,diameter:.24,tessellation:20},scene);
      corner.parent=bus;corner.position.set(x,2.04,z);corner.material=white;
    }
    const roofEdge=BABYLON.MeshBuilder.CreateCylinder("rounded roof edge rail",{height:10.62,diameter:.105,tessellation:16},scene);
    roofEdge.parent=bus;roofEdge.rotation.x=Math.PI/2;roofEdge.position.set(x,3.37,0);roofEdge.material=white;
  }
  box("front roof drip lip",2.48,.075,.16,0,3.48,5.30,white);
  box("rear roof drip lip",2.48,.075,.16,0,3.48,-5.30,white);

  for(const side of [-1,1]){
    box("roof edge rain gutter",.045,.045,10.5,side*1.285,3.34,0,chrome);
    box("thin blue side waist stripe",.035,.095,10.55,side*1.305,1.72,0,blueDark);
  }
  // Wide single-piece Venad windscreen, slightly reclined like the reference.
  // Gently bowed panoramic windscreen built as a curved surface, not a flat box.
  const windscreenPaths=[];
  for(let row=0;row<=8;row++){
    const y=2.20+row*(1.28/8),path=[];
    for(let col=0;col<=16;col++){
      const u=col/16,x=-1.115+u*2.23;
      const bow=.105*(1-Math.pow((x/1.115),2));
      path.push(new BABYLON.Vector3(x,y,5.505+bow));
    }
    windscreenPaths.push(path);
  }
  const windscreen=BABYLON.MeshBuilder.CreateRibbon("curved single-piece panoramic windshield",{pathArray:windscreenPaths,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  windscreen.parent=bus;windscreen.material=glassFront;
  const screenTopPath=[],screenBottomPath=[];
  for(let i=0;i<=24;i++){
    const x=-1.17+i*(2.34/24),bow=.105*(1-Math.pow(x/1.17,2));
    screenTopPath.push(new BABYLON.Vector3(x,3.49,5.49+bow));
    screenBottomPath.push(new BABYLON.Vector3(x,2.17,5.49+bow));
  }
  for(const [name,path] of [["windscreen curved upper rubber seal",screenTopPath],["windscreen curved lower rubber seal",screenBottomPath]]){
    const trim=BABYLON.MeshBuilder.CreateTube(name,{path,radius:.035,tessellation:10},scene);
    trim.parent=bus;trim.material=black;
  }
  // Separate upper-windscreen stickers, matching the reference photograph.
  const ksrtcStickerTex=new BABYLON.DynamicTexture("KSRTC upper windscreen sticker",{width:512,height:160},scene,false);
  const ks=ksrtcStickerTex.getContext();ks.fillStyle="#e9f2f4";ks.fillRect(0,0,512,160);
  ks.fillStyle="#1676b5";ks.font="bold 104px Arial";ks.textAlign="center";ks.fillText("KSRTC",256,116);ksrtcStickerTex.update();
  makeTextReadable(ksrtcStickerTex);
  const ksrtcStickerMat=new BABYLON.StandardMaterial("KSRTC sticker material",scene);
  ksrtcStickerMat.diffuseTexture=ksrtcStickerTex;ksrtcStickerMat.emissiveColor=new BABYLON.Color3(.12,.12,.12);ksrtcStickerMat.backFaceCulling=false;
  const ksrtcSticker=BABYLON.MeshBuilder.CreatePlane("KSRTC upper-left glass sticker",{width:1.05,height:.32,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  ksrtcSticker.parent=bus;ksrtcSticker.position.set(.58,3.29,5.575);ksrtcSticker.material=ksrtcStickerMat;
  const destination=box("upper-right destination display",.92,.22,.035,-.60,3.30,5.575,board);
  const destinationTex=new BABYLON.DynamicTexture("destination display lettering",{width:512,height:128},scene,false);
  const dc=destinationTex.getContext();dc.fillStyle="#17252a";dc.fillRect(0,0,512,128);
  dc.fillStyle="#d8e0dc";dc.font="bold 42px Arial";dc.textAlign="center";dc.fillText("PALAKKAD",256,82);destinationTex.update();
  makeTextReadable(destinationTex);
  const destinationMat=new BABYLON.StandardMaterial("destination lettering material",scene);
  destinationMat.diffuseTexture=destinationTex;destinationMat.emissiveColor=new BABYLON.Color3(.08,.08,.08);destinationMat.backFaceCulling=false;
  const destinationText=BABYLON.MeshBuilder.CreatePlane("destination text on glass",{width:.84,height:.17,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  destinationText.parent=bus;destinationText.position.set(-.60,3.30,5.60);destinationText.material=destinationMat;
  // Rear glass and rear destination/route panel.
  box("rear window surround",2.12,1.02,.08,0,2.83,-5.47,black);
  box("rear window",2.02,.91,.04,0,2.83,-5.525,glass);
  // Rear glazing finish: slim rubber bead, horizontal divisions and corner seals.
  box("rear glass inner rubber bead",1.94,.82,.025,0,2.83,-5.55,black);
  box("rear glass inset pane",1.86,.74,.018,0,2.83,-5.568,glass);
  for(let i=0;i<3;i++){
    box("rear window horizontal divider "+i,1.82,.012,.018,0,2.59+i*.24,-5.585,chrome);
  }
  for(const x of [-.91,.91]){
    box("rear window vertical edge seal",.025,.76,.025,x,2.83,-5.585,black);
  }
  box("rear window lower sill",1.9,.045,.035,0,2.34,-5.59,chrome);
  box("rear window upper seal",1.9,.035,.03,0,3.29,-5.585,black);

  box("rear route panel",1.45,.25,.07,0,3.39,-5.49,board);
  // Traditional squared front face with broad ribbed Leyland grille.
  box("front destination display recess",1.68,.22,.055,0,3.38,5.49,black);
  // Raised, clearly visible KSRTC front board mounted ahead of the windscreen.
  const frontKsrtcBacking=box("raised front KSRTC board backing",1.86,.34,.10,0,3.48,5.59,blueDark);
  const frontKsrtcFace=box("front KSRTC board face",1.76,.27,.018,0,3.48,5.65,board);
  const frontKsrtcTex=new BABYLON.DynamicTexture("front KSRTC board lettering",{width:768,height:160},scene,false);
  const fkc=frontKsrtcTex.getContext();
  fkc.fillStyle="#17252a";fkc.fillRect(0,0,768,160);
  fkc.strokeStyle="#e7eceb";fkc.lineWidth=9;fkc.strokeRect(5,5,758,150);
  fkc.fillStyle="#ffffff";fkc.font="bold 112px Arial";fkc.textAlign="center";fkc.textBaseline="middle";fkc.fillText("KSRTC",384,82);
  frontKsrtcTex.update();makeTextReadable(frontKsrtcTex);
  const frontKsrtcMat=new BABYLON.StandardMaterial("front KSRTC board material",scene);
  frontKsrtcMat.diffuseTexture=frontKsrtcTex;frontKsrtcMat.emissiveColor=new BABYLON.Color3(.22,.22,.22);frontKsrtcMat.backFaceCulling=false;
  const frontKsrtcBoard=BABYLON.MeshBuilder.CreatePlane("front KSRTC lettering board",{width:1.72,height:.235,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  frontKsrtcBoard.parent=bus;frontKsrtcBoard.position.set(0,3.48,5.665);frontKsrtcBoard.material=frontKsrtcMat;
  // Broad tapered grille: shorter upper/lower slats and a wider centre, as in the photo.
  box("front grille outer surround",1.28,.76,.09,0,1.64,5.52,chrome);
  box("front grille dark inset",1.19,.68,.045,0,1.64,5.575,black);
  const grilleWidths=[.72,.88,1.02,1.12,1.12,1.02,.88,.72];
  for(let i=0;i<8;i++)box("tapered horizontal grille rib "+i,grilleWidths[i],.043,.04,0,1.35+i*.083,5.61,chrome);
  box("grille centre emblem mount",.24,.22,.06,0,1.64,5.645,hub);
  // Refined front grille centre badge with a raised circular medallion and wing-like metal bars.
  const grilleBadge=BABYLON.MeshBuilder.CreateCylinder("front grille centre medallion",{
    diameter:.19,height:.075,tessellation:32
  },scene);
  grilleBadge.parent=bus;grilleBadge.rotation.x=Math.PI/2;
  grilleBadge.position.set(0,1.64,5.69);grilleBadge.material=chrome;
  const grilleBadgeCore=BABYLON.MeshBuilder.CreateCylinder("front grille badge inset",{
    diameter:.105,height:.082,tessellation:24
  },scene);
  grilleBadgeCore.parent=bus;grilleBadgeCore.rotation.x=Math.PI/2;
  grilleBadgeCore.position.set(0,1.64,5.735);grilleBadgeCore.material=blueDark;
  for(const side of [-1,1]){
    const wing=box("grille badge horizontal wing",.34,.035,.035,side*.255,1.64,5.675,chrome);
    wing.rotation.z=side*.035;
    const wingTip=box("grille badge wing tip",.055,.075,.04,side*.42,1.64,5.675,chrome);
  }

  const badgeTex=new BABYLON.DynamicTexture("Ashok Leyland nameplate texture",{width:512,height:128},scene,false);
  const badgeCtx=badgeTex.getContext();
  badgeCtx.fillStyle="#e8e9e5";badgeCtx.fillRect(0,0,512,128);
  badgeCtx.fillStyle="#17252a";badgeCtx.font="bold 54px Arial";badgeCtx.textAlign="center";badgeCtx.fillText("ASHOK LEYLAND",256,84);badgeTex.update();
  makeTextReadable(badgeTex);
  const badgeMat=new BABYLON.StandardMaterial("Ashok Leyland nameplate material",scene);
  // Use a front-facing plane for legible, non-mirrored nameplate lettering.
  badgeMat.diffuseTexture=badgeTex;badgeMat.emissiveColor=new BABYLON.Color3(.12,.12,.12);
  const badgePlate=BABYLON.MeshBuilder.CreatePlane("ASHOK LEYLAND upright nameplate",{width:1.18,height:.2,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  badgePlate.parent=bus;badgePlate.position.set(0,2.08,5.625);badgePlate.material=badgeMat;
  box("front registration plate",.78,.2,.06,0,.98,5.58,mat("Yellow registration plate","#e8c33c"));
  const regTex=new BABYLON.DynamicTexture("Kerala registration lettering",{width:512,height:128},scene,false);
  const rc=regTex.getContext();rc.fillStyle="#e8c33c";rc.fillRect(0,0,512,128);
  rc.fillStyle="#18252b";rc.font="bold 76px Arial";rc.textAlign="center";rc.fillText("KL 15 8119",256,88);regTex.update();
  makeTextReadable(regTex);
  const regMat=new BABYLON.StandardMaterial("registration lettering material",scene);
  regMat.diffuseTexture=regTex;regMat.emissiveColor=new BABYLON.Color3(.08,.07,.02);regMat.backFaceCulling=false;
  const regText=BABYLON.MeshBuilder.CreatePlane("front registration lettering",{width:.73,height:.18,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  regText.parent=bus;regText.position.set(0,.98,5.62);regText.material=regMat;

  // Two round lamps set into the lower front corners, as in the supplied photo.
  for(const x of [-.99,.99]){
    const bezel=BABYLON.MeshBuilder.CreateCylinder("round headlamp black bezel",{diameter:.43,height:.09,tessellation:32},scene);
    bezel.parent=bus;bezel.rotation.x=Math.PI/2;bezel.position.set(x,1.42,5.55);bezel.material=black;
    const lens=BABYLON.MeshBuilder.CreateCylinder("round headlamp lens",{diameter:.32,height:.095,tessellation:32},scene);
    lens.parent=bus;lens.rotation.x=Math.PI/2;lens.position.set(x,1.42,5.61);lens.material=lamp;
    const indicator=box("small amber indicator",.19,.14,.07,x*1.12,1.17,5.57,amber);
  }
  // Front lamp finishing: slim stainless bezels and recessed indicator surrounds.
  for(const x of [-.99,.99]){
    const outerHeadlampRing=BABYLON.MeshBuilder.CreateTorus("stainless headlamp outer ring",{
      diameter:.46,thickness:.028,tessellation:32
    },scene);
    outerHeadlampRing.parent=bus;
    outerHeadlampRing.position.set(x,1.42,5.665);
    outerHeadlampRing.material=chrome;
    const innerHeadlampRing=BABYLON.MeshBuilder.CreateTorus("headlamp inner glass rim",{
      diameter:.255,thickness:.012,tessellation:32
    },scene);
    innerHeadlampRing.parent=bus;
    innerHeadlampRing.position.set(x,1.42,5.668);
    innerHeadlampRing.material=white;
    box("amber indicator black gasket",.235,.18,.025,x*1.12,1.17,5.615,black);
    box("amber indicator clear outer lens",.175,.12,.018,x*1.12,1.17,5.635,amber);
  }
  box("full-width blue front bumper",2.65,.27,.22,0,.64,5.52,blueDark);
  box("bumper narrow silver edge",2.56,.045,.035,0,.50,5.65,chrome);
  // ONE driver's-side wiper, mounted at the upper windscreen edge.
  const wiperPivot=BABYLON.MeshBuilder.CreateCylinder("single upper driver-side wiper pivot",{diameter:.085,height:.055,tessellation:24},scene);
  wiperPivot.parent=bus;wiperPivot.rotation.x=Math.PI/2;
  wiperPivot.position.set(.48,3.445,5.602);wiperPivot.material=black;
  const wiperArm=box("single upper-mounted windscreen wiper arm",.045,.88,.035,.43,2.99,5.635,black);
  wiperArm.rotation.z=.12;
  const wiperBlade=box("single windscreen wiper blade",.62,.035,.04,.56,2.58,5.65,black);
  wiperBlade.rotation.z=-.30;
  // Tall rectangular passenger windows with dark rubber surrounds and curtains.
  for(const side of [-1,1]){
    for(let i=0;i<7;i++){
      const z=4.25-i*1.35;
      box("side window black rubber surround",.065,1.16,1.20,side*1.315,2.78,z,black);
      box("side passenger glazing",.035,1.07,1.11,side*1.355,2.79,z,glass);
      box("side window centre divider",.04,1.08,.035,side*1.38,2.79,z,black);
      // Slim aluminium window sill and upper sliding-pane rail.
      box("side window upper aluminium rail",.035,.035,1.12,side*1.385,3.325,z,chrome);
      box("side window lower aluminium sill",.035,.035,1.12,side*1.385,2.245,z,chrome);
      box("sliding window latch",.045,.075,.055,side*1.405,2.39,z+.34,chrome);
      // Rounded-corner rubber glazing bead follows the actual window perimeter.
      const windowSealPath=[];
      const sealX=side*1.405,halfW=.585,halfH=.555,cornerR=.105;
      const corners=[
        [z+halfW-cornerR,2.79+halfH-cornerR,0,90],
        [z-halfW+cornerR,2.79+halfH-cornerR,90,180],
        [z-halfW+cornerR,2.79-halfH+cornerR,180,270],
        [z+halfW-cornerR,2.79-halfH+cornerR,270,360]
      ];
      for(const [cz,cy,start,end] of corners){
        for(let a=0;a<=6;a++){
          const angle=(start+(end-start)*a/6)*Math.PI/180;
          windowSealPath.push(new BABYLON.Vector3(sealX,cy+cornerR*Math.sin(angle),cz+cornerR*Math.cos(angle)));
        }
      }
      const roundedWindowSeal=BABYLON.MeshBuilder.CreateTube("rounded side window rubber bead",{path:windowSealPath,radius:.022,tessellation:8,closeArray:true},scene);
      roundedWindowSeal.parent=bus;roundedWindowSeal.material=black;

      for(const curtainZ of [z-.48,z+.48]){
        box("interior window curtain",.025,.96,.045,side*1.325,2.79,curtainZ,seat);
      }
    }
    box("side window lower rubber rail",.055,.065,9.65,side*1.34,2.18,0,black);
    box("side blue belt stripe",.04,.105,10.5,side*1.35,1.72,0,blueDark);
    // Continuous fine trim separates the window band from the ivory bodywork.
    box("side upper blue pinstripe",.035,.035,10.42,side*1.365,2.12,0,blue);
    box("side lower body rub rail",.045,.055,10.2,side*1.365,1.20,0,chrome);

    // Properly projecting exterior mirrors: the reflective face looks rearward toward the driver.
    const mirrorBase=new BABYLON.Vector3(side*1.24,3.08,5.03);
    const mirrorTip=new BABYLON.Vector3(side*1.58,3.10,5.34);
    const mirrorAxis=mirrorTip.subtract(mirrorBase);
    const mirrorArm=BABYLON.MeshBuilder.CreateCylinder("angled exterior mirror support",{
      height:mirrorAxis.length(),diameter:.075,tessellation:16
    },scene);
    mirrorArm.parent=bus;
    mirrorArm.position=mirrorBase.add(mirrorTip).scale(.5);
    const mirrorDirection=mirrorAxis.normalize();
    const mirrorRotationAxis=BABYLON.Vector3.Cross(BABYLON.Axis.Y,mirrorDirection);
    if(mirrorRotationAxis.lengthSquared()>1e-8){
      mirrorArm.rotationQuaternion=BABYLON.Quaternion.RotationAxis(
        mirrorRotationAxis.normalize(),
        Math.acos(Math.max(-1,Math.min(1,BABYLON.Vector3.Dot(BABYLON.Axis.Y,mirrorDirection))))
      );
    }
    mirrorArm.material=black;
    box("rectangular exterior mirror housing",.38,.48,.14,side*1.59,3.12,5.36,black);
    box("mirror glass rear-facing surface",.31,.39,.025,side*1.59,3.12,5.275,glassFront);
    box("mirror glass inner highlight",.025,.30,.012,side*1.59,3.12,5.257,chrome);
    box("mirror lower protective edge",.35,.035,.15,side*1.59,2.88,5.36,black);
  }
  // Two passenger doors, reflecting the two-door Venad layout.
  for(const [idx,z] of [[0,3.05],[1,-3.72]]){
    const side=-1;
    box("door dark frame "+idx,.09,2.15,1.02,side*1.34,1.92,z,black);
    box("door upper glass "+idx,.045,1.18,.88,side*1.405,2.27,z,glass);
    box("door lower blue panel "+idx,.05,.63,.9,side*1.405,1.34,z,blue);
    box("door centre rail "+idx,.055,.06,.9,side*1.43,1.63,z,chrome);
    box("door vertical handle "+idx,.04,.36,.035,side*1.45,1.83,z+.34,chrome);
    // Door glazing divider, paired hinges and a visible grab rail.
    box("door glass vertical divider "+idx,.045,1.14,.045,side*1.445,2.27,z,black);
    for(const hingeY of [1.15,2.52]){
      box("door hinge "+idx,.045,.18,.09,side*1.455,hingeY,z-.43,chrome);
    }
    box("door grab rail "+idx,.045,.72,.055,side*1.46,2.16,z+.37,chrome);
    box("door lower kick plate "+idx,.045,.12,.72,side*1.455,1.08,z,chrome);

    // Visible low entry step with a non-slip tread surface and defined edge.
    box("entry step "+idx,.68,.12,.94,side*1.05,.46,z,chrome);
    box("entry step dark tread pad "+idx,.57,.018,.78,side*1.05,.528,z,black);
    for(let tread=0;tread<6;tread++){
      box("entry step anti-slip groove "+idx+" "+tread,.53,.012,.025,side*1.05,.54,z-.31+tread*.124,chrome);
    }
    for(const edgeZ of [-.43,.43]){
      box("entry step raised side lip "+idx,.035,.045,.035,side*1.05,.55,z+edgeZ,chrome);
    }
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
      // Concentric steel-rim bead and eight dark ventilation recesses add depth to each wheel face.
      const rimBead=BABYLON.MeshBuilder.CreateTorus("wheel rim outer bead",{diameter:.57,thickness:.028,tessellation:32},scene);
      rimBead.parent=bus;rimBead.rotation.y=Math.PI/2;rimBead.position.set(x*1.045,.7,z);rimBead.material=chrome;
      const innerBead=BABYLON.MeshBuilder.CreateTorus("wheel rim inner bead",{diameter:.39,thickness:.022,tessellation:32},scene);
      innerBead.parent=bus;innerBead.rotation.y=Math.PI/2;innerBead.position.set(x*1.05,.7,z);innerBead.material=chrome;
      for(let vent=0;vent<8;vent++){
        const a=vent*Math.PI/4;
        const recess=BABYLON.MeshBuilder.CreateCylinder("wheel rim ventilation recess",{diameter:.075,height:.385,tessellation:16},scene);
        recess.parent=bus;recess.rotation.z=Math.PI/2;
        recess.position.set(x*1.04,.7+Math.sin(a)*.205,z+Math.cos(a)*.205);
        recess.material=black;
      }
      const cap=BABYLON.MeshBuilder.CreateCylinder("wheel hub cap",{diameter:.22,height:.38,tessellation:24},scene);
      // Six small wheel nuts give the steel hub a more finished mechanical appearance.
      for(let n=0;n<6;n++){
        const a=n*Math.PI/3;
        const nut=BABYLON.MeshBuilder.CreateCylinder("wheel lug nut",{diameter:.065,height:.39,tessellation:12},scene);
        nut.parent=bus;nut.rotation.z=Math.PI/2;
        nut.position.set(x*1.03,.7+Math.sin(a)*.235,z+Math.cos(a)*.235);
        nut.material=chrome;
      }

      cap.parent=bus;cap.rotation.z=Math.PI/2;cap.position.set(x*1.025,.7,z);cap.material=chrome;
    }
  }
  // Rear tail lamps, number plate, and simple bumper.
  // Side-mounted rectangular route/fleet panel, kept as a blank enamel plate for now.
  for(const side of [-1,1]){
    const panel=box("side fleet information plate",.045,.24,.82,side*1.385,1.98,4.82,white);
    box("side fleet panel border",.05,.28,.86,side*1.36,1.98,4.82,chrome);
  }

  for(const x of [-.94,.94]){
    box("rear lamp housing",.32,.68,.08,x,1.48,-5.51,black);
    box("rear red lamp",.23,.28,.05,x,1.63,-5.57,red);
    box("rear amber lamp",.23,.17,.05,x,1.39,-5.57,amber);
    box("rear reverse lamp",.23,.12,.05,x,1.2,-5.57,lamp);
  }
  box("rear bumper",2.55,.22,.2,0,.62,-5.52,blueDark);
  // Rear lamp bezels, inset lenses and bumper corner caps.
  for(const x of [-.94,.94]){
    box("rear lamp outer chrome bezel",.36,.72,.035,x,1.48,-5.57,chrome);
    box("rear lamp inset surround",.29,.65,.025,x,1.48,-5.60,black);
    box("rear red lens upper reflector",.24,.075,.035,x,1.82,-5.63,red);
    box("rear bumper corner cap",.16,.25,.22,x*1.34,.62,-5.52,chrome);
    box("rear red side reflector",.045,.12,.2,x*1.45,.92,-5.25,red);
  }
  box("rear number plate mount",.82,.22,.045,0,.98,-5.58,black);
  box("rear number plate face",.74,.15,.025,0,.98,-5.61,white);
  // Small rear engine ventilation slots, kept as physical dark slats rather than text decals.
  for(let i=0;i<5;i++){
    box("rear ventilation slot "+i,.72,.035,.025,0,2.04+i*.095,-5.57,black);
  }
  box("rear tow hook mount",.28,.12,.18,0,.43,-5.53,chrome);
  const towHook=BABYLON.MeshBuilder.CreateTorus("rear tow hook",{diameter:.22,thickness:.035,tessellation:20},scene);
  towHook.parent=bus;towHook.position.set(0,.30,-5.66);towHook.rotation.x=Math.PI/2;towHook.material=chrome;

  // Interior visible through side windows: floor, aisle, paired passenger seats and rails.
  const interior=new BABYLON.TransformNode("bus interior",scene);interior.parent=bus;
  box("interior floor",2.22,.12,9.95,0,1.02,0,floorMat,interior);
  // Gently crowned ceiling panel follows the roof instead of using a flat box.
  const ceilingPaths=[];
  for(let row=0;row<=24;row++){
    const z=4.92-row*(9.84/24),path=[];
    for(let col=0;col<=12;col++){
      const x=-1.12+col*(2.24/12);
      const crown=.075*(1-Math.pow(x/1.12,2));
      path.push(new BABYLON.Vector3(x,3.27+crown,z));
    }
    ceilingPaths.push(path);
  }
  const ceiling=BABYLON.MeshBuilder.CreateRibbon("gently crowned passenger ceiling",{pathArray:ceilingPaths,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  ceiling.parent=interior;ceiling.material=white;
  // Longitudinal overhead grab rails with short hanging supports.
  for(const x of [-.78,.78]){
    const rail=BABYLON.MeshBuilder.CreateCylinder("longitudinal overhead grab rail",{height:9.25,diameter:.045,tessellation:16},scene);
    rail.parent=interior;rail.rotation.x=Math.PI/2;rail.position.set(x,2.98,-.02);rail.material=chrome;
    for(let z=3.8;z>=-4.0;z-=1.3){
      const hanger=BABYLON.MeshBuilder.CreateCylinder("overhead rail hanger",{height:.24,diameter:.025,tessellation:12},scene);
      hanger.parent=interior;hanger.position.set(x,3.105,z);hanger.material=chrome;
    }
  }
  box("front driver partition",2.1,1.5,.08,0,2.0,4.48,black,interior);
  // Right-hand-drive cockpit: driver position is on the bus's right side.
  box("driver seat base",.62,.25,.62,.62,1.5,4.05,seat,interior);
  box("driver seat back",.62,.9,.2,.62,2.02,4.28,seat,interior);
  for(let row=0;row<10;row++){
    const z=3.25-row*.83;
    for(const x of [-.66,.66]){
      // Soft, rounded seat cushions and gently reclined padded backs.
      const cushion=BABYLON.MeshBuilder.CreateSphere("rounded passenger seat cushion",{diameter:1,segments:20},scene);
      cushion.parent=interior;cushion.scaling.set(.29,.105,.31);cushion.position.set(x,1.46,z);cushion.material=seat;
      const back=BABYLON.MeshBuilder.CreateSphere("sculpted passenger seat backrest",{diameter:1,segments:20},scene);
      back.parent=interior;back.scaling.set(.29,.39,.105);back.position.set(x,1.82,z-.205);back.rotation.x=-.10;back.material=seat;
      const headPad=BABYLON.MeshBuilder.CreateSphere("upper seat back padded crown",{diameter:1,segments:16},scene);
      headPad.parent=interior;headPad.scaling.set(.255,.105,.085);headPad.position.set(x,2.13,z-.20);headPad.material=seat;
      const support=BABYLON.MeshBuilder.CreateCylinder("seat pedestal support",{height:.36,diameter:.055,tessellation:16},scene);
      support.parent=interior;support.position.set(x,1.23,z);support.material=chrome;
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
  // Refined driver's area: steering column, instrument dials and grab rail.
  const steeringColumn=BABYLON.MeshBuilder.CreateCylinder("steering column",{height:.42,diameter:.075,tessellation:16},scene);
  steeringColumn.parent=interior;steeringColumn.position.set(.62,2.05,4.78);steeringColumn.rotation.x=.35;steeringColumn.material=chrome;
  box("dashboard upper brow",1.25,.09,.32,.62,2.29,4.76,black,interior);
  for(let i=0;i<3;i++){
    const gauge=BABYLON.MeshBuilder.CreateCylinder("dashboard gauge "+i,{diameter:.13,height:.025,tessellation:24},scene);
    gauge.parent=interior;gauge.rotation.x=Math.PI/2;gauge.position.set(.30+i*.30,2.20,4.99);gauge.material=lamp;
  }
  const driverGrab=BABYLON.MeshBuilder.CreateCylinder("driver grab rail",{height:1.1,diameter:.035,tessellation:12},scene);
  driverGrab.parent=interior;driverGrab.position.set(1.02,2.05,4.12);driverGrab.material=chrome;

  box("VENAD lettering plate",.78,.18,.045,0,2.18,5.57,white);
  const venadTex=new BABYLON.DynamicTexture("VENAD red lettering",{width:384,height:96},scene,false);
  const vc=venadTex.getContext();vc.clearRect(0,0,384,96);vc.fillStyle="#9c3441";vc.font="italic bold 62px Georgia";vc.textAlign="center";vc.fillText("VENAD",192,70);venadTex.update();
  makeTextReadable(venadTex);
  const venadMat=new BABYLON.StandardMaterial("VENAD lettering material",scene);
  venadMat.diffuseTexture=venadTex;venadMat.emissiveColor=new BABYLON.Color3(.1,.025,.03);venadMat.backFaceCulling=false;
  const venadText=BABYLON.MeshBuilder.CreatePlane("VENAD front lettering",{width:.70,height:.16,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  venadText.parent=bus;venadText.position.set(0,2.18,5.60);venadText.material=venadMat;

  // Keep the front lettering clear of the windscreen and destination display.
  // Fleet number on the front-left body panel (not repeated across the glass).
  const fleetTex=new BABYLON.DynamicTexture("front fleet number texture",{width:384,height:128},scene,false);
  const ft=fleetTex.getContext();ft.clearRect(0,0,384,128);ft.fillStyle="#a63848";ft.font="bold 76px Arial";ft.textAlign="center";ft.fillText("EAC 934",192,88);fleetTex.update();
  makeTextReadable(fleetTex);
  const fleetMat=new BABYLON.StandardMaterial("front fleet number material",scene);
  fleetMat.diffuseTexture=fleetTex;fleetMat.emissiveColor=new BABYLON.Color3(.12,.04,.04);fleetMat.backFaceCulling=false;
  const fleetNo=BABYLON.MeshBuilder.CreatePlane("front fleet number",{width:.72,height:.24,sideOrientation:BABYLON.Mesh.DOUBLESIDE},scene);
  fleetNo.parent=bus;fleetNo.position.set(.93,2.02,5.59);fleetNo.material=fleetMat;
  // Small side route/branding panels.
  for(const side of [-1,1]){
    box("side VENAD branding panel",.035,.42,1.12,side*1.39,1.98,-.15,blueDark);
    box("side white logo panel",.035,.26,.72,side*1.415,2.0,-.15,white);
  }
  bus.position.set(0,0,-20);
  // Professional presentation pass: subtle paint highlights, shadows and clean glass reflections.
  bus.getChildMeshes().forEach(mesh=>{mesh.receiveShadows=true;shadows.addShadowCaster(mesh);});
  const frontHighlight=box("front upper body highlight trim",2.38,.035,.035,0,2.245,5.49,chrome);
  const frontLowerSeam=box("front lower panel seam",2.42,.025,.025,0,1.12,5.49,chrome);
  for(const side of [-1,1]){
    for(const z of [-4.75,-2.1,.25,2.55,4.7]){
      const marker=box("side amber marker lamp",.045,.11,.22,side*1.365,1.05,z,amber);
      // Layered side-marker bezels and clear amber lenses for a more finished body edge.
      box("side marker black gasket",.055,.16,.27,side*1.397,1.05,z,black);
      box("side marker chrome rim",.025,.135,.245,side*1.432,1.05,z,chrome);
      box("side marker amber lens",.018,.095,.20,side*1.449,1.05,z,amber);

    }
    for(const z of [-4.95,4.95]){
      const mudflap=box("rear wheel mudflap",.045,.62,.72,side*1.38,.46,z,black);
    }
    // Fine stainless strips around the window line.
    box("side upper window belt trim",.035,.035,9.72,side*1.37,3.38,0,chrome);
  }
  ground.receiveShadows=true;


  // Four camera views: chase, smooth follow, orbit and cockpit.
  const fixedCamera=new BABYLON.UniversalCamera("fixed chase",new BABYLON.Vector3(0,5.4,-17),scene);
  const busFocus=new BABYLON.Vector3(0,2.0,0);

  fixedCamera.parent=bus;fixedCamera.minZ=.1;
  const smoothCamera=new BABYLON.UniversalCamera("smooth follow",new BABYLON.Vector3(0,6.2,-25),scene);
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
  const smoothPosition=new BABYLON.Vector3(0,6.2,-25),lookTarget=new BABYLON.Vector3(0,2,0);
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