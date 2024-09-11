import type { Peer } from 'crossws';
import dgram from 'node:dgram';

const wm = new WeakMap<Peer<unknown>, dgram.Socket>();

const mocopiPacketHeader = Buffer.from('IwAAAGhlYWQSAAAAZnR5cHNvbnkgbW90aW9uIGZvcm1hdA==', 'base64');

export default defineWebSocketHandler({
  open(peer) {
    const port = Number(new URL(peer.url, 'ws://localhost').searchParams.get('port') ?? '12351');
    const socket = dgram.createSocket('udp4');
    socket.on('message', (message, remote) => {
      if (message.byteLength === 1591 && message.subarray(0, mocopiPacketHeader.byteLength).equals(mocopiPacketHeader)) {
        // mocopi pose packet
        let next = message.subarray();
        const pose: number[][] = [];
        for (;;) {
          const offset = next.toString('ascii').indexOf('tran');
          if (offset < 0) {
            break;
          }
          next = next.subarray(offset + 4);
          const view = new DataView(next.buffer, next.byteOffset, 7 * 4);
          pose.push(new Array(7).fill(0).map((_, i) => view.getFloat32(i*4, true)));
        }
        peer.send(JSON.stringify({ pose }));
      }
    });
    socket.on('close', () => {
      console.log('[udp] close', port);
    });
    socket.on('listening', () => {
      console.log('[udp] listening', socket.address());
    });
    socket.bind(port, '0.0.0.0');
    wm.set(peer, socket);
  },

  message(peer, message) {
    //
  },

  close(peer, event) {
    wm.get(peer)?.close();
    wm.delete(peer);
    console.log('[ws] close', peer, event);
  },

  error(peer, error) {
    wm.get(peer)?.close();
    wm.delete(peer);
    console.log('[ws] error', peer, error);
  },
});
