// Lazy chunk: the Flight reply encoder (enableFlightLazyClientParser splits it out of client.browser).
// A tiny local wrapper gives the CJS package named ESM exports so the dynamic import can be split.
import * as reply from 'react-server-dom-webpack/client.browser.reply';
export const encodeReply = reply.encodeReply;
