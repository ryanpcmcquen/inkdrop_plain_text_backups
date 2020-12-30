"use strict";

var _fs = require("fs");

var path = _interopRequireWildcard(require("path"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const self = module.exports = {
  dataMap: {
    books: {},
    notes: {}
  },

  getBackupPath() {
    return inkdrop.config.get().core.db.backupPath;
  },

  getPlainTextPath(backupPath) {
    return `${backupPath || self.getBackupPath()}/PLAIN_TEXT`;
  },

  getDataMapPath(plainTextPath) {
    return `${plainTextPath || self.getPlainTextPath()}/._DATA_MAP_.json`;
  },

  getNotePath() {},

  async getDataMap(plainTextPath) {
    return JSON.parse(await _fs.promises.readFile(self.getDataMapPath(plainTextPath), "utf8"));
  },

  async writeNote(notePath, body) {
    await _fs.promises.mkdir(path.dirname(notePath), {
      recursive: true
    });
    await _fs.promises.writeFile(notePath, body);
  },

  async getDataAndWriteAllNotes(disposable, plainTextPath) {
    // Sync everything one time:
    const allNotes = await disposable.notes.all();
    return new Promise(async (resolve, reject) => {
      await Promise.all(await allNotes.docs.map(async doc => {
        if (!self.dataMap.notes[doc._id]) {
          self.dataMap.notes[doc._id] = {};
        }

        self.dataMap.notes[doc._id].title = doc.title;
        const bookData = await disposable.books.get(doc.bookId);

        if (bookData && bookData !== null && bookData !== void 0 && bookData.name) {
          self.dataMap.books[doc.bookId] = bookData.name;
          self.dataMap.notes[doc._id].path = `${plainTextPath}/${bookData.name}/${doc.title}.md`;
          await self.writeNote(self.dataMap.notes[doc._id].path, doc.body);
        }
      }));
      resolve(self.dataMap);
    });
  },

  async writeMaps(plainTextPath, maps) {
    await _fs.promises.mkdir(plainTextPath, {
      recursive: true
    });
    await _fs.promises.writeFile(self.getDataMapPath(plainTextPath), JSON.stringify(maps));
  },

  async importAll() {
    const plainTextPath = self.getPlainTextPath();
    const diskDataMap = await self.getDataMap(plainTextPath);
    const db = inkdrop.main.dataStore.getLocalDB();
    await Promise.all(await Object.keys(diskDataMap.notes).map(async noteId => {
      const newBody = await _fs.promises.readFile(diskDataMap.notes[noteId].path, "utf8");

      try {
        const currentNote = await db.notes.get(noteId); // Don't bother if there are no changes:

        if (currentNote.body !== newBody) {
          await db.notes.put({
            _id: noteId,
            _rev: currentNote._rev,
            updatedAt: Date.now(),
            bookId: currentNote.bookId,
            title: currentNote.title,
            doctype: currentNote.doctype,
            createdAt: currentNote.createdAt,
            body: newBody
          });
        }
      } catch (err) {
        console.warn(`${noteId} import from plain text failed!`, err);
      }
    }));
    db.dispose();
  }

};