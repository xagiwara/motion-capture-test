import asyncio
import urllib.parse
from websockets.asyncio.server import serve, ServerConnection
import os
import urllib.parse
import struct
import base64
import json

MOCOPI_DEFAULT_PORT = 12351

mocopi_packet_header = base64.decodebytes(
    b"IwAAAGhlYWQSAAAAZnR5cHNvbnkgbW90aW9uIGZvcm1hdA=="
)


class Protocol(asyncio.DatagramProtocol):
    def __init__(self, ws: ServerConnection) -> None:
        self.ws = ws

    def datagram_received(self, message: bytes, addr):
        if len(message) == 1591 and message.startswith(mocopi_packet_header):
            bonedatas = message.split(b"tran")[1:]
            values = [struct.unpack("<fffffff", data[0 : 4 * 7]) for data in bonedatas]
            asyncio.get_running_loop().create_task(
                self.ws.send(json.dumps({"pose": values}))
            )


async def handle(websocket: ServerConnection):
    query = urllib.parse.urlparse(websocket.request.path).query
    qs = urllib.parse.parse_qs(query)
    port = qs.get("port", [MOCOPI_DEFAULT_PORT])[0]

    loop = asyncio.get_running_loop()
    transport, protocol = await loop.create_datagram_endpoint(
        lambda: Protocol(websocket), local_addr=("0.0.0.0", int(port))
    )
    print(f"Listening on udp://0.0.0.0:{port}")

    await websocket.wait_closed()
    transport.close()
    print("Connection closed")


async def main():
    async with serve(handle, "0.0.0.0", os.environ["PORT"]) as server:
        print(f"Listening on ws://{server.sockets[0].getsockname()}")
        await asyncio.get_running_loop().create_future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
