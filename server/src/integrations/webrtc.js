/**
 * WebRTC signalling helpers.
 * The actual peer connection lives in the browser; this module simply records
 * call-room metadata and brokers SDP/ICE messages between users via the
 * websocket layer.
 */
const cache = require('../config/redis');

const ROOM_TTL = 60 * 30; // 30 mins

const createRoom = async (roomId, ownerId) => {
  await cache.set(`webrtc:${roomId}`, { ownerId, createdAt: Date.now(), peers: [] }, ROOM_TTL);
  return { roomId, ownerId };
};

const joinRoom = async (roomId, peerId) => {
  const room = (await cache.get(`webrtc:${roomId}`)) || { peers: [] };
  if (!room.peers.includes(peerId)) room.peers.push(peerId);
  await cache.set(`webrtc:${roomId}`, room, ROOM_TTL);
  return room;
};

const leaveRoom = async (roomId, peerId) => {
  const room = await cache.get(`webrtc:${roomId}`);
  if (!room) return null;
  room.peers = (room.peers || []).filter((p) => p !== peerId);
  await cache.set(`webrtc:${roomId}`, room, ROOM_TTL);
  return room;
};

const getRoom = async (roomId) => cache.get(`webrtc:${roomId}`);

module.exports = { createRoom, joinRoom, leaveRoom, getRoom };
