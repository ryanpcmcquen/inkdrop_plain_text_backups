"use strict";

var _fs = require("fs");

var _restore_sidebar = _interopRequireDefault(require("./restore_sidebar"));

var _restore_modal = _interopRequireDefault(require("./restore_modal"));

var _utilities = _interopRequireDefault(require("./utilities"));

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
        inkdrop.components.registerClass(_restore_sidebar.default);
        inkdrop.layouts.insertComponentToLayoutAfter(_restore_sidebar.default.layoutName, "SideBarMenuItemTrash", _restore_sidebar.default.name);
        inkdrop.components.registerClass(_restore_modal.default);
        inkdrop.layouts.addComponentToLayout(_restore_modal.default.layoutName, _restore_modal.default.name); // Sync stuff on changes:

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

      inkdrop.components.deleteClass(_restore_sidebar.default);
    }
  }

};