// src/hooks/useWebSocket.js
// Connects to backend WS at ws://localhost:8000/ws for real-time alerts.
// Backs off gracefully when the backend is offline — won't spam connections.
import { useEffect, useRef } from 'react';

const RETRY_DELAY_MS  = 8000;  // wait 8s before each retry
const MAX_RETRIES     = 5;     // stop after 5 failed attempts (backend likely offline)

export default function useWebSocket(onMessage) {
  const wsRef      = useRef(null);
  const retryRef   = useRef(null);
  const retriesRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;
      if (retriesRef.current >= MAX_RETRIES) {
        console.info('[PulseGrid WS] Backend WebSocket unavailable — stopped retrying (local mode active)');
        return;
      }

      const url = `ws://${window.location.hostname}:8000/ws`;
      let ws;
      try {
        ws = new WebSocket(url);
      } catch {
        schedule();
        return;
      }

      ws.onopen = () => {
        console.info('[PulseGrid WS] Connected to backend');
        retriesRef.current = 0; // reset on success
      };

      ws.onmessage = (e) => {
        try { onMessage(JSON.parse(e.data)); }
        catch { onMessage(e.data); }
      };

      ws.onerror  = () => { /* handled in onclose */ };

      ws.onclose  = () => {
        if (!cancelled) {
          retriesRef.current++;
          schedule();
        }
      };

      wsRef.current = ws;
    }

    function schedule() {
      if (!cancelled && retriesRef.current < MAX_RETRIES) {
        retryRef.current = setTimeout(connect, RETRY_DELAY_MS);
      }
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
