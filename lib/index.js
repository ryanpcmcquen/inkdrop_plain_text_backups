"use strict";

var _fs = require("fs");

var RestoreSidebar = _interopRequireWildcard(require("./restore_sidebar"));

var _utilities = _interopRequireDefault(require("./utilities"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

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
        inkdrop.components.registerClass(RestoreSidebar.default);
        inkdrop.layouts.insertComponentToLayoutAfter(RestoreSidebar.layoutName, "SideBarMenuItemTrash", RestoreSidebar.componentName); // Sync stuff on changes:

        this.disposable.onChange(async change => {
          var _change$doc, _change$doc2;

          try {
            const typeOfChange = change.id.split(":")[0];

            switch (typeOfChange) {
              case "note":
                const bookPath = `${plainTextPath}/${_utilities.default.dataMap.books[change.doc.bookId]}`; // If the title has changed, rename the old note.

                if (change !== null && change !== void 0 && (_change$doc = change.doc) !== null && _change$doc !== void 0 && _change$doc.title && change.doc.title !== _utilities.default.dataMap.notes[change.id].title) {
                  const oldDataMap = await _utilities.default.getDataMap(plainTextPath);
                  await _fs.promises.rename(`${bookPath}/${oldDataMap.notes[change.id].title}.md`, `${bookPath}/${change.doc.title}.md`);
                  _utilities.default.dataMap.notes[change.id].title = change.doc.title;
                }

                await _utilities.default.writeNote(`${bookPath}/${change.doc.title}.md`, change.doc.body);
                await _utilities.default.writeMaps(plainTextPath, _utilities.default.dataMap);
                break;

              case "book":
                if (change !== null && change !== void 0 && (_change$doc2 = change.doc) !== null && _change$doc2 !== void 0 && _change$doc2.name && change.doc.name !== _utilities.default.dataMap.books[change.id]) {
                  const oldDataMap = await _utilities.default.getDataMap(plainTextPath);
                  await _fs.promises.rename(`${plainTextPath}/${oldDataMap.books[change.id]}`, `${plainTextPath}/${change.doc.name}`);
                  _utilities.default.dataMap.books[change.id] = change.doc.name;
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

      inkdrop.components.deleteClass(RestoreSidebar.default);
    }
  }

};