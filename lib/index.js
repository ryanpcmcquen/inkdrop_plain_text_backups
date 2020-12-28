"use strict";

var _fs = require("fs");

var _eventKit = require("event-kit");

var RestoreSidebar = _interopRequireWildcard(require("./restore_sidebar"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

module.exports = {
  subscriptions: new _eventKit.CompositeDisposable(),
  disposable: null,
  dataMap: {
    books: {},
    notes: {}
  },
  getDataMapPath: plainTextPath => {
    return `${plainTextPath}/.__DATA_MAP__.json`;
  },

  async writeNote(path, title, body) {
    await _fs.promises.mkdir(path, {
      recursive: true
    });
    await _fs.promises.writeFile(`${path}/${title}.md`, body);
  },

  async getDataAndWriteAllNotes(plainTextPath) {
    // Sync everything one time:
    const allNotes = await this.disposable.notes.all();
    return new Promise(async (resolve, reject) => {
      await Promise.all(await allNotes.docs.map(async doc => {
        this.dataMap.notes[doc._id] = doc.title;
        const bookData = await this.disposable.books.get(doc.bookId);

        if (bookData && bookData !== null && bookData !== void 0 && bookData.name) {
          this.dataMap.books[doc.bookId] = bookData.name;
          await this.writeNote(`${plainTextPath}/${bookData.name}`, doc.title, doc.body);
        }
      }));
      resolve(this.dataMap);
    });
  },

  async writeMaps(plainTextPath, maps) {
    await _fs.promises.mkdir(plainTextPath, {
      recursive: true
    });
    await _fs.promises.writeFile(this.getDataMapPath(plainTextPath), JSON.stringify(maps));
  },

  async activate() {
    if (inkdrop && !inkdrop.isMobile) {
      const backupPath = inkdrop.config.get().core.db.backupPath;

      if (backupPath) {
        const plainTextPath = `${backupPath}/PLAIN_TEXT`;
        this.disposable = inkdrop.main.dataStore.getLocalDB();
        await this.getDataAndWriteAllNotes(plainTextPath);
        await this.writeMaps(plainTextPath, this.dataMap);
        inkdrop.components.registerClass(RestoreSidebar.default); // debugger;

        this.subscriptions.add(inkdrop.commands.add(document.body, {
          "plain_text_backups:restore_all_backups": RestoreSidebar.toggle
        }));
        RestoreSidebar.show(); // Sync stuff on changes:

        this.disposable.onChange(async change => {
          var _change$doc;

          try {
            const typeOfChange = change.id.split(":")[0];

            switch (typeOfChange) {
              case "note":
                const bookPath = `${plainTextPath}/${this.dataMap.books[change.doc.bookId]}`; // If the title has changed, rename the old note.

                if (change.doc.title !== this.dataMap.notes[change.id]) {
                  const oldDataMap = JSON.parse(await _fs.promises.readFile(this.getDataMapPath(plainTextPath), "utf8"));
                  await _fs.promises.rename(`${bookPath}/${oldDataMap.notes[change.id]}.md`, `${bookPath}/${change.doc.title}.md`);
                  this.dataMap.notes[change.id] = change.doc.title;
                }

                await this.writeNote(bookPath, change.doc.title, change.doc.body);
                await this.writeMaps(plainTextPath, this.dataMap);
                break;

              case "book":
                if (change !== null && change !== void 0 && (_change$doc = change.doc) !== null && _change$doc !== void 0 && _change$doc.name && change.doc.name !== this.dataMap.books[change.id]) {
                  const oldDataMap = JSON.parse(await _fs.promises.readFile(this.getDataMapPath(plainTextPath), "utf8"));
                  await _fs.promises.rename(`${plainTextPath}/${oldDataMap.books[change.id]}`, `${plainTextPath}/${change.doc.name}`);
                  this.dataMap.books[change.id] = change.doc.name;
                  await this.writeMaps(plainTextPath, this.dataMap);
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

      this.subscriptions.dispose();
      inkdrop.components.deleteClass(RestoreSidebar.default);
    }
  }

};