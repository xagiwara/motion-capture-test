import type { Peer } from 'crossws';
import { Server } from 'node-osc';

const wm = new WeakMap<Peer<unknown>, Server>();

const convertMode = (gl: boolean, data: { position?: [number, number, number]; rotation?: [number, number, number, number]}) =>
  gl ? {
    position: data.position ? [-data.position[0], data.position[1], -data.position[2]] : undefined,
    rotation: data.rotation ? [data.rotation[0], -data.rotation[1], data.rotation[2], -data.rotation[3]] : undefined,
  } : data;

export default defineWebSocketHandler({
  open(peer) {
    const searchParams = new URL(peer.url, 'ws://localhost').searchParams;
    const port = Number(searchParams.get('port') ?? '39539');
    const glMode = Boolean(searchParams.get('gl'));
    const server = new Server(port, '0.0.0.0', () => {
      console.log(`[osc] listening: ${port}`);
    });
    server.on('message', (message) => {
      console.log(message);
    });
    server.on('bundle', (bundle) => {
      const pose: {
        [key: string]: {
          position?: number[];
          rotation?: number[];
        };
      } = {};
      bundle.elements.forEach((element, i) => {
        if (Array.isArray(element)) {
          if (element[0] === '/VMC/Ext/Bone/Pos') {
            pose[element[1][0].toLowerCase() + element[1].slice(1)] =  {
              position: [element[2], -element[3], element[4]],
              rotation: [element[5], element[6], -element[7], -element[8]],
            };
          }
          if (element[0] === '/VMC/Ext/Root/Pos') {
            const root =  {
              position: [element[2], -element[3], element[4]],
              rotation: [element[5], element[6], -element[7], -element[8]],
            };
            peer.send(JSON.stringify({ root }));
          }
        }
      });
      if (Object.entries(pose).length > 0) {
        peer.send(JSON.stringify({ pose }));
      } else {
        // console.log(bundle);
      }
    });
    wm.set(peer, server);
  },

  close(peer, event) {
    wm.get(peer)?.close();
    wm.delete(peer);
    console.log('[osc] close', peer, event);
  },

  error(peer, error) {
    wm.get(peer)?.close();
    wm.delete(peer);
    console.log('[osc] error', peer, error);
  },
});
