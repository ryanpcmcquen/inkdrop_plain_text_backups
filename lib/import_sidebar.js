"use strict";
"use babel";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _import_modal = _interopRequireDefault(require("./import_modal"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// This has to be an 'old-school' function because
// it relies on the 'name' property.
class ImportSidebar extends React.Component {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "handleClick", () => {
      inkdrop.commands.dispatch(document.body, "plain_text_backups:toggle_dialog");
    });
  }

  render() {
    const {
      SideBarMenuItem
    } = inkdrop.components.classes;
    return /*#__PURE__*/React.createElement(SideBarMenuItem, {
      className: "plain_text_backups__import_sidebar",
      indentLevel: 0,
      onClick: this.handleClick,
      renderIcon: () => {
        return /*#__PURE__*/React.createElement("i", {
          className: "redo icon"
        });
      }
    }, "Import Plain Text");
  }

}

_defineProperty(ImportSidebar, "layoutName", "sidebar-menu");

var _default = ImportSidebar;
exports.default = _default;
//# sourceMappingURL=import_sidebar.js.map