"use strict";

var _fs = require("fs");

var _import_sidebar = _interopRequireDefault(require("./import_sidebar"));

var _import_modal = _interopRequireDefault(require("./import_modal"));

var _utilities = _interopRequireDefault(require("./utilities"));

var path = _interopRequireWildcard(require("path"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = {
  disposable: null,

  async activate() {
    if (inkdrop && !inkdrop.isMobile) {
      const backupPath = _utilities.default.getBackupPath();

      if (backupPath) {
        const plainTextPath = _utilities.default.getPlainTextPath(backupPath);

        this.disposable = inkdrop.main.dataStore.getLocalDB();
        await _utilities.default.getDataAndWriteAllNotes(this.disposable, plainTextPath);
        await _utilities.default.writeMaps(plainTextPath, _utilities.default.dataMap);
        inkdrop.components.registerClass(_import_sidebar.default);
        inkdrop.layouts.insertComponentToLayoutAfter(_import_sidebar.default.layoutName, "SideBarMenuItemTrash", _import_sidebar.default.name);
        inkdrop.components.registerClass(_import_modal.default);
        inkdrop.layouts.addComponentToLayout(_import_modal.default.layoutName, _import_modal.default.name); // Sync stuff on changes:

        this.disposable.onChange(async change => {
          var _change$doc, _utilities$dataMap$no, _change$doc2;

          try {
            const typeOfChange = change.id.split(":")[0];

            switch (typeOfChange) {
              case "note":
                const bookPath = `${plainTextPath}/${_utilities.default.dataMap.books[change.doc.bookId]}`;

                if (!_utilities.default.dataMap.notes[change.id]) {
                  _utilities.default.dataMap.notes[change.id] = {};
                } // If the title has changed, rename the old note.


                if (change !== null && change !== void 0 && (_change$doc = change.doc) !== null && _change$doc !== void 0 && _change$doc.title && (_utilities$dataMap$no = _utilities.default.dataMap.notes[change.id]) !== null && _utilities$dataMap$no !== void 0 && _utilities$dataMap$no.title && change.doc.title !== _utilities.default.dataMap.notes[change.id].title) {
                  const oldDataMap = await _utilities.default.getDataMap(plainTextPath);
                  await _fs.promises.rename(`${bookPath}/${oldDataMap.notes[change.id].title}.md`, `${bookPath}/${change.doc.title}.md`);
                }

                _utilities.default.dataMap.notes[change.id].title = change.doc.title;
                _utilities.default.dataMap.notes[change.id].path = `${_utilities.default.dataMap.books[change.doc.bookId]}/${change.doc.title}.md`;
                await _utilities.default.writeNote(`${plainTextPath}/${_utilities.default.dataMap.notes[change.id].path}`, change.doc.body);
                await _utilities.default.writeMaps(plainTextPath, _utilities.default.dataMap);
                break;

              case "book":
                debugger;
                console.log(_utilities.default.dataMap.books[change.id]);
                console.log(path.basename(_utilities.default.dataMap.books[change.id]));

                if (change !== null && change !== void 0 && (_change$doc2 = change.doc) !== null && _change$doc2 !== void 0 && _change$doc2.name && change.doc.name !== path.basename(_utilities.default.dataMap.books[change.id])) {
                  const oldDataMap = await _utilities.default.getDataMap(plainTextPath);
                  await _fs.promises.rename(`${plainTextPath}/${oldDataMap.books[change.id]}`, `${plainTextPath}/${change.doc.name}`);
                  let bookPath = await _utilities.default.getBookPath(this.disposable, change.doc);
                  _utilities.default.dataMap.books[change.id] = bookPath;
                  await _utilities.default.writeMaps(plainTextPath, _utilities.default.dataMap);
                }

                break;
            }
          } catch (err) {
            console.warn("Plain text backup may have had an issue:", err);
          }
        });
      }
    }
  },

  deactivate() {
    if (inkdrop && !inkdrop.isMobile) {
      if (this.disposable) {
        this.disposable.dispose();
      }

      inkdrop.components.deleteClass(_import_sidebar.default);
      inkdrop.layouts.removeComponentFromLayout(_import_sidebar.default.layoutName, _import_sidebar.default.name);
      inkdrop.components.deleteClass(_import_modal.default);
      layouts.removeComponentFromLayout("modal", _import_modal.default.name);
    }
  }

};
//# sourceMappingURL=index.js.map