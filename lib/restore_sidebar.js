"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.componentName = exports.layoutName = exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _utilities = require("./utilities");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// This has to be an 'old-school' function because
// it relies on the 'name' property.
function RestoreSidebar() {
  const {
    SideBarMenuItem
  } = inkdrop.components.classes;

  const handleClick = async () => {
    await (0, _utilities.restoreAll)();
  };

  return /*#__PURE__*/React.createElement(SideBarMenuItem, {
    className: "plain_text_backups__restore_sidebar",
    indentLevel: 0,
    onClick: handleClick,
    renderIcon: () => {
      return /*#__PURE__*/React.createElement("i", {
        className: "redo icon"
      });
    }
  }, "RESTORE ALL");
}

const layoutName = "sidebar-menu";
exports.layoutName = layoutName;
const componentName = RestoreSidebar.name;
exports.componentName = componentName;
var _default = RestoreSidebar;
exports.default = _default;