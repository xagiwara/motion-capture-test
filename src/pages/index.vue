<template>
  <div style="display: contents">
    <canvas ref="canvasRef" />
    <div class="menu-container" @dragover.prevent="rootDragover" @drop.prevent="rootDrop">
      <LeftMenuPanel class="leftmenu" />
      <div class="rightmenu">
        <div>RightMenu</div>
      </div>
      <div class="bottommenu">
        <div>BottomMenu</div>
      </div>
      <div id="content" class="content" ref="contentElementRef">
        <!-- -->
      </div>
      <div class="header">
        Header
      </div>
      <MenuFooter class="footer" />
      <!-- <div class="menus">
      <div class="menu">
        <p>設定→外部サービスとの接続設定</p>
        <p>送信フォーマット: mocopi(UDP)</p>
        <p>IPアドレス: 確認して設定</p>
        <p>
          送信ポート設定: <input v-model="mocopiPort" :disabled="!!connection">
        </p>
        <p>
          <button v-if="!connection" @click="connect">Listen</button>
          <button v-else @click="disconnect">Disonnect</button>
        </p>
      </div>
      <div class="menu">
        <p>
          送信ポート設定: <input v-model="vmcPort" :disabled="!!connectionVMC">
        </p>
        <p>
          <button v-if="!connectionVMC" @click="connectVMC">Listen</button>
          <button v-else @click="disconnectVMC">Disonnect</button>
        </p>
      </div>
    </div> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils, type VRM, type VRMPose } from '@pixiv/three-vrm';

const runtimeConfig = useRuntimeConfig();

const mocopiPort = ref(Number(`${runtimeConfig.public.mocopiDefaultPort}`.split('-')[0]));
const vmcPort = ref(Number(`${runtimeConfig.public.vmcDefaultPort}`.split('-')[0]));

const contentElementRef = ref<HTMLElement>();
const canvasRef = ref<HTMLCanvasElement>();

const connection = shallowRef<WebSocket>();
const poseDataRaw = ref<number[][]>();
const poseDataWithName = ref<{
  [bone: string]: {
    rotation: [number, number, number, number],
    position: [number, number, number],
  }
}>({});
const poseDataRoot = ref<{ rotation: [number, number, number, number], position: [number, number, number] }>({ rotation: [0, 0, 0, 1], position: [0, 0, 0] });

const connect = () => {
  if (connection.value) {
    return;
  }

  const ws = new WebSocket(`ws://${location.host}/listen/mocopi?port=${mocopiPort.value}`);
  connection.value = ws;
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.pose) {
      poseDataRaw.value = data.pose;
    }
  };
};

const disconnect = () => {
  connection.value?.close();
  connection.value = undefined;
};

const connectionVMC = shallowRef<WebSocket>();
const connectVMC = () => {
  if (connectionVMC.value) {
    return;
  }

  const ws = new WebSocket(`ws://${location.host}/listen/vmc?port=${vmcPort.value}&gl=1`);
  connectionVMC.value = ws;
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.pose) {
      Object.assign(poseDataWithName.value, data.pose);
    }
    if (data.root) {
      Object.assign(poseDataRoot.value, data.root);
    }
  };
  ws.onclose = () => {
    connectionVMC.value = undefined;
  };
};

const disconnectVMC = () => {
  connectionVMC.value?.close();
  connectionVMC.value = undefined;
};

const fpsMeasure = useRendererFPSMeasure();
const { currentFPS } = fpsMeasure;


onMounted(async () => {
  const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value });
  const camera = new THREE.PerspectiveCamera(30.0, window.innerWidth / window.innerHeight, 0.1, 20.0);
  camera.position.set(0.0, 1.0, -5.0);
  camera.lookAt(0.0, 1.0, 0.0);
  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff, Math.PI);
  light.position.set(1.0, 1.0, 1.0).normalize();
  scene.add(light);
  const loader = new GLTFLoader();
  loader.crossOrigin = 'anonymous';

  loader.register((parser) => new VRMLoaderPlugin(parser));
  const currentVrm = await new Promise<VRM>((resolve, reject) => {
    loader.load(
      new URL('@/assets/8590256991748008892.vrm', import.meta.url).href,
      (gltf) => {
        const vrm: VRM = gltf.userData.vrm;
        VRMUtils.removeUnnecessaryVertices(gltf.scene);
        VRMUtils.removeUnnecessaryJoints(gltf.scene);
        vrm.scene.traverse((obj) => {
          obj.frustumCulled = false;
        });
        resolve(vrm);
      },
      (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
      (error) => {
        console.error(error);
        reject(error);
      },
    );
  });

  // TODO: default pose
  currentVrm.scene.position.set(0.0, -1.0, 0.0);
  currentVrm.update(10.0);
  scene.add(currentVrm.scene);

  const gridHelper = new THREE.GridHelper(10, 10);
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(gridHelper, axesHelper);

  const clock = new THREE.Clock();
  clock.start();

  function animate() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.aspect = window.innerWidth / window.innerHeight;
    const rect = contentElementRef.value?.getBoundingClientRect();
    if (rect) {
      camera.setViewOffset(rect.width, rect.height, -rect.x, -rect.y, window.innerWidth, window.innerHeight);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();

    requestAnimationFrame(animate);

    if (currentVrm) {
      currentVrm.humanoid.setNormalizedPose(poseDataWithName.value);
      // currentVrm.humanoid.update();
      currentVrm.scene.position.set(...poseDataRoot.value.position);
      currentVrm.scene.quaternion.set(...poseDataRoot.value.rotation);
      currentVrm.springBoneManager?.reset();
      currentVrm.update(clock.getDelta());
      // if (poseDataRaw.value) {
      //   const poseData = poseDataRaw.value;
      //   const q = poseData.map((data) => data.slice(0, 4)).map((data) => [data[0], -data[1], data[2], -data[3]] as [number, number, number, number]);
      //   const t = poseData.map((data) => data.slice(4)).map(data => [-data[0], data[1], -data[2]] as [number, number, number]);
      //   quat.multiply(q[2], q[1], q[2]);
      //   quat.multiply(q[4], q[3], q[4]);
      //   quat.multiply(q[6], q[5], q[6]);
      //   quat.multiply(q[8], q[7], q[8]);
      //   quat.multiply(q[10], q[9], q[10]);
      //   Vec3.add(t[2], t[1], t[2]);
      //   Vec3.add(t[4], t[3], t[4]);
      //   Vec3.add(t[6], t[5], t[6]);
      //   Vec3.add(t[8], t[7], t[8]);
      //   Vec3.add(t[10], t[9], t[10]);
      //   currentVrm.humanoid.setNormalizedPose({
      //     hips: { rotation: q[0], position: t[0] },
      //     spine: { rotation: q[2], position: t[2] },
      //     chest: { rotation: q[4], position: t[4] },
      //     upperChest: { rotation: q[6], position: t[6] },
      //     neck: { rotation: q[8], position: t[8] },
      //     head: { rotation: q[10], position: t[10] },
      //     leftShoulder: { rotation: q[11], position: t[11] },
      //     leftUpperArm: { rotation: q[12], position: t[12] },
      //     leftLowerArm: { rotation: q[13], position: t[13] },
      //     leftHand: { rotation: q[14], position: t[14] },
      //     rightShoulder: { rotation: q[15], position: t[15] },
      //     rightUpperArm: { rotation: q[16], position: t[16] },
      //     rightLowerArm: { rotation: q[17], position: t[17] },
      //     rightHand: { rotation: q[18], position: t[18] },
      //     leftUpperLeg: { rotation: q[19], position: t[19] },
      //     leftLowerLeg: { rotation: q[20], position: t[20] },
      //     leftFoot: { rotation: q[21], position: t[21] },
      //     rightUpperLeg: { rotation: q[23], position: t[23] },
      //     rightLowerLeg: { rotation: q[24], position: t[24] },
      //     rightFoot: { rotation: q[25], position: t[25] },
      //     rightToes: { rotation: q[26], position: t[26] },
      //   });
      // }
    }
    renderer.render(scene, camera);

    fpsMeasure.pushFrame();
  }

  animate();
});

const rootDragover = (event: DragEvent) => {
  event.preventDefault();
};

const rootDrop = (event: DragEvent) => {
  console.log(event.dataTransfer?.files[0]);
  event.preventDefault();
};
</script>

<style lang="scss" scoped>
canvas {
  background: gray;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.menus {
  position: fixed;
  width: auto;

  .menu {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    color: white;
    border: 1px solid white;
  }
}

.menu-container {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 0;

  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr auto;

  .leftmenu {
    grid-column: 1;
    grid-row: 1 / 4;
  }

  .rightmenu {
    grid-column: 3;
    grid-row: 1 / 4;
  }

  .bottommenu {
    grid-column: 2;
    grid-row: 3;
  }

  .content {
    grid-column: 2;
    grid-row: 2;
  }

  .header {
    grid-column: 2;
    grid-row: 1;
  }

  .footer {
    grid-column: 1 / 4;
    grid-row: 4;
  }

  .leftmenu,
  .rightmenu,
  .bottommenu,
  .footer,
  .header {
    position: relative;
  }

  .leftmenu,
  .rightmenu {
    z-index: 2;
  }

  .bottommenu {
    z-index: 1;
  }

  .leftmenu,
  .rightmenu,
  .bottommenu,
  .footer {
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
    // color: white;
    // border: 1px solid white;
  }
}
</style>
