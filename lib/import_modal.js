"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

var _utilities = require("./utilities");

var _eventKit = require("event-kit");

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class ImportModal extends React.Component {
  constructor(props) {
    super(props); // Register command that toggles this dialog:

    _defineProperty(this, "subscriptions", new _eventKit.CompositeDisposable());

    _defineProperty(this, "toggle", () => {
      const {
        dialogRef
      } = this;

      if (!dialogRef.isShown) {
        dialogRef.showDialog();
      } else {
        dialogRef.dismissDialog();
      }
    });

    this.subscriptions.add(inkdrop.commands.add(document.body, {
      "plain_text_backups:toggle_dialog": this.toggle
    }));
  }

  componentWillUnmount() {
    this.subscriptions.dispose();
  }

  render() {
    const {
      MessageDialog
    } = inkdrop.components.classes;
    return /*#__PURE__*/React.createElement(MessageDialog, {
      ref: el => {
        return this.dialogRef = el;
      },
      modalSettings: {
        closable: false,
        autofocus: true
      },
      title: () => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("i", {
        className: "redo icon"
      }), "Import from plain text backups?"),
      buttons: [{
        label: "No",
        cancel: true
      }, {
        label: "Yes",
        primary: true
      }],
      onDismiss: async (caller, buttonIndex) => {
        if (buttonIndex === 1) {
          // User confirms restoration:
          await (0, _utilities.importAll)();
        } else {
          // User rejects restoration:
          return true;
        }
      }
    }, /*#__PURE__*/React.createElement("p", null, "Are you sure you want to import from your plain text notes?", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), "Located at: ", /*#__PURE__*/React.createElement("code", null, (0, _utilities.getPlainTextPath)()), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("strong", null, "WARNING:"), " This will overwrite existing data with data from your plain text notes and COULD RESULT IN DATA LOSS."));
  }

}

_defineProperty(ImportModal, "layoutName", "modal");

var _default = ImportModal;
exports.default = _default;
//# sourceMappingURL=import_modal.js.map