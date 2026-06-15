import {
  require_jsx_runtime
} from "./chunk-7Q3DJPV2.js";
import {
  require_react
} from "./chunk-PDNHVAOE.js";
import {
  __toESM
} from "./chunk-2TUXWMP5.js";

// node_modules/@radix-ui/react-direction/dist/index.mjs
var React = __toESM(require_react(), 1);
var import_jsx_runtime = __toESM(require_jsx_runtime(), 1);
var DirectionContext = React.createContext(void 0);
function useDirection(localDir) {
  const globalDir = React.useContext(DirectionContext);
  return localDir || globalDir || "ltr";
}

export {
  useDirection
};
//# sourceMappingURL=chunk-P6XIGYJR.js.map
