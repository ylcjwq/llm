[OPEN] Debug Session: chat-sse-reset

# Bug Summary

- Symptom: Frontend `fetchEventSource` POST to `/api/conversations/:id/chat` reports `net::ERR_CONNECTION_RESET` and `SSE connection error: TypeError: network error`.
- Expected: Request stays open as an SSE stream and continuously returns events until completion.

# Initial Hypotheses

1. The backend chat endpoint throws during streaming after headers/status are written, causing the socket to be reset.
2. The SSE response is being terminated by an unhandled exception inside orchestrator / model selection / model invocation.
3. The local service on `localhost:4001` is restarting or crashing during the request rather than returning a normal HTTP error body.
4. A proxy / middleware / CORS / compression behavior is interfering with SSE and forcibly closing the connection.
5. The request reaches the controller, but the upstream model call hangs or fails in a way that aborts the HTTP stream.

# Plan

1. Inspect the chat endpoint and SSE write path.
2. Add minimal instrumentation only around request entry / model resolution / streaming lifecycle / error path.
3. Reproduce the issue and collect runtime evidence.
4. Confirm or reject hypotheses from logs.
5. Apply the smallest fix only after evidence is clear.
