import { WebSocketServer } from 'ws';
import { parse as parseUrl } from 'url';
import { subscriber, buildChannel } from '../redis/index.js';
import { verifyToken } from '../middleware/auth.js';

// Map<chatId, Set<WebSocket>>
const wsClients = new Map();

// Track which Redis channels we are subscribed to
const activeChannels = new Set();

/**
 * Attach the WebSocket server to an existing HTTP server.
 * Handles route: ws://.../ws/:chatId?token=<jwt>
 *
 * @param {import('http').Server} httpServer
 */
export function attachWebSocket(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  // ── Upgrade handler ────────────────────────────────────────────────────────
  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname, query } = parseUrl(req.url, true);

    // Only handle /ws/:chatId
    const match = pathname.match(/^\/ws\/([^/]+)$/);
    if (!match) {
      socket.destroy();
      return;
    }

    const chatId = match[1];
    const token  = query.token;

    // Verify JWT before upgrading
    let user;
    try {
      user = verifyToken(token);
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, chatId, user);
    });
  });

  // ── Connection handler ────────────────────────────────────────────────────
  wss.on('connection', async (socket, _req, chatId, user) => {
    console.log(`[WS] Client connected — chatId=${chatId} userId=${user.id}`);

    // Register client
    if (!wsClients.has(chatId)) wsClients.set(chatId, new Set());
    wsClients.get(chatId).add(socket);

    // Subscribe to Redis channel (once per channel)
    const channel = buildChannel(chatId);
    if (!activeChannels.has(channel)) {
      await subscriber.subscribe(channel);
      activeChannels.add(channel);
      console.log(`[WS] Subscribed to Redis channel: ${channel}`);
    }

    // Send welcome frame
    safeSend(socket, JSON.stringify({ type: 'connected', chatId }));

    // ── Client messages ──────────────────────────────────────────────────
    socket.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'ping') {
          safeSend(socket, JSON.stringify({ type: 'pong' }));
        }
      } catch { /* ignore malformed frames */ }
    });

    // ── Disconnect cleanup ────────────────────────────────────────────────
    socket.on('close', async () => {
      console.log(`[WS] Client disconnected — chatId=${chatId}`);
      const clients = wsClients.get(chatId);
      if (clients) {
        clients.delete(socket);
        if (clients.size === 0) {
          wsClients.delete(chatId);
          await subscriber.unsubscribe(channel);
          activeChannels.delete(channel);
          console.log(`[WS] Unsubscribed from Redis channel: ${channel}`);
        }
      }
    });

    socket.on('error', (err) => {
      console.error(`[WS] Socket error chatId=${chatId}:`, err.message);
    });
  });

  // ── Redis → WebSocket broadcast ──────────────────────────────────────────
  subscriber.on('message', (channel, message) => {
    // channel pattern: "build:<chatId>"
    const chatId = channel.replace(/^build:/, '');
    const clients = wsClients.get(chatId);
    if (!clients || clients.size === 0) return;

    for (const socket of clients) {
      safeSend(socket, message);
    }
  });

  console.log('[WS] WebSocket server attached');
  return wss;
}

function safeSend(socket, data) {
  try {
    if (socket.readyState === 1 /* OPEN */) {
      socket.send(data);
    }
  } catch (err) {
    console.error('[WS] send error:', err.message);
  }
}