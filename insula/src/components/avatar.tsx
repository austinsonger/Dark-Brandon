import { Canvas } from "@react-three/fiber";
import { useLoader, useThree, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useState, useEffect, useRef } from "react";
import { VRMExpressionPresetName, VRMLoaderPlugin, VRMUtils, VRM } from '@pixiv/three-vrm'
import { visemeToExpression } from "../utils/mapVisemeToExpression"
import { avatars } from "../data/avatars"
import { useGLTF } from '@react-three/drei'
import { loadMixamoAnimation } from "../utils/loadMixamoAnimation"
import * as THREE from "three"
import { io } from "socket.io-client";
import { speakOnce } from "../utils/tts";
import { getTokenOrRefresh } from "../utils";


avatars.forEach((avatar) => (useGLTF.preload(avatar.vrmFileName)))
let currentMixer = undefined;

const Model = (props) => {
  const avatar = useRef<VRM>()
  const [startTime, setStartTime] = useState(0)
  const { sc, camera }: { sc: any, camera: any } = useThree()
  const [isLoaded, setIsLoaded] = useState(false)
  const [visemes, setVisemes] = useState([])
  const [message, setMessage] = useState(null)
  const clipList = useRef([])
  const [avatarClock, setAvatarClock] = useState(new THREE.Clock())
  const curAvatar = avatars[0]
  const visemesRef = useRef(visemes);

  useEffect(() => {
    visemesRef.current = visemes;
  }, [visemes]);

  const gltf = useLoader(GLTFLoader, curAvatar.vrmFileName, (loader) => {
    loader.register((parser) => {
      return new VRMLoaderPlugin(parser, { autoUpdateHumanBones: true })
    })
  })

  VRMUtils.rotateVRM0(gltf.userData.vrm);
  const vrm: VRM = gltf.userData.vrm
  vrm.scene.traverse((obj) => {

    obj.frustumCulled = false;

  });
  avatar.current = vrm

  function loadFBX() {
    currentMixer = new THREE.AnimationMixer(vrm.scene);
    Promise.all([loadMixamoAnimation("greet.fbx", vrm), loadMixamoAnimation("idle.fbx", vrm), loadMixamoAnimation("dance.fbx", vrm), loadMixamoAnimation("fight.fbx", vrm)]).then(
      (clips) => {
        clipList.current = clips
        const idleAnimation = currentMixer.clipAction(clips[1])
        idleAnimation.play()
        setIsLoaded(true)
      })
  }

  function playAnimation(num) {
    currentMixer = new THREE.AnimationMixer(vrm.scene);
    const idleAnimation = currentMixer.clipAction(clipList.current[1])
    const curAnimation = currentMixer.clipAction(clipList.current[num])

    function crossFadeToIdle() {
      curAnimation.crossFadeTo(idleAnimation, 2, false)
      idleAnimation.play()
    }
    currentMixer.addEventListener('finished', function () {
      crossFadeToIdle();
    });
    curAnimation.clampWhenFinished = true;
    curAnimation.setLoop(THREE.LoopOnce, 1)
    curAnimation.play()
  }

  useEffect(() => {
    loadFBX()
    const clock = new THREE.Clock()
    clock.start()
    setAvatarClock(clock)
  }, [props.curAvatarId]);

  useEffect(() => {
    setStartTime(new Date().getTime() + 300)
  }, [visemes])


  useEffect(() => {
    if (message === null) {
      return;
    }

    getTokenOrRefresh().then((tokenObj) => {
      console.log("calling speakOnce")
      speakOnce(message, tokenObj, setVisemes, curAvatar.voice)
    }

    );
  }, [message])

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on('twitchMessage', (twitchMessage) => {
      console.log("received a twitch message", "message:", twitchMessage)
      if (!message) {
        console.log("setting message")
        setMessage(twitchMessage)
      }
    });

    socket.on("botCommand", (command) => {
      if (command === "dance") {
        playAnimation(2)
      } else if (command === "fight") {
        playAnimation(3)
      }
    });


    return () => {
      socket.disconnect();
    };
  }, []);

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime()
    let curVisemeId = 0

    camera.updateProjectionMatrix()
    if (startTime > 0 && visemes.length > 0) {

      curVisemeId = visemes[visemes.length - 1].privVisemeId
      while (visemes.length > 0 && new Date().getTime() - startTime > visemes[visemes.length - 1].privAudioOffset / 10000) {
        visemes.pop()
      }
      if (visemes.length > 0) {
        curVisemeId = visemes[visemes.length - 1].privVisemeId
      } else {
        setMessage(null)
      }
    }

    if (currentMixer) {
      currentMixer.update(delta)
    }


    if (avatar.current) {
      avatar.current.lookAt.target = camera
      avatar.current.update(delta)
      const blinkDelay = 10
      const blinkFrequency = 3
      if (avatarClock.getElapsedTime() > 4 && Math.round(t * blinkFrequency) % blinkDelay === 0) {
        avatar.current.expressionManager.setValue('blink', 1 - Math.abs(Math.sin(t * blinkFrequency * Math.PI)))
      } else if (avatarClock.getElapsedTime() < 4) {
        avatar.current.expressionManager.setValue('blink', 0)
      }
      const expressions = [VRMExpressionPresetName.Aa, VRMExpressionPresetName.Ih, VRMExpressionPresetName.Ou, VRMExpressionPresetName.Ee, VRMExpressionPresetName.Ee, VRMExpressionPresetName.Oh]
      expressions.forEach(expression => avatar.current.expressionManager.setValue(expression, 0))
      avatar.current.expressionManager.setValue('happy', 0.2)
      const [curExpression, curVal] = visemeToExpression[curVisemeId]
      avatar.current.expressionManager.setValue(curExpression, curVal)
    }

  })
  return (
    <>
      {isLoaded ? <primitive object={gltf.scene} position={[0, -1.6, 0]} /> : <Html center>Loading...</Html>}
    </>
  )
}

export default function Avatar() {
  return (
    <>
      <Canvas camera={{ fov: 30.0, aspect: window.innerWidth / window.innerHeight, near: 0.1, far: 20.0, position: [0, -0.1, 1] }}>
        <ambientLight intensity={0.8} />
        <OrbitControls
        />
        <spotLight position={[0, 0, -1]} intensity={0.6} />
        <group>
          <Model />
        </group>
      </Canvas>
    </>
  );
}
