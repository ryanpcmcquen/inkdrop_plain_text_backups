"use strict";

var fs = _interopRequireWildcard(require("fs"));

var path = _interopRequireWildcard(require("path"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const self = module.exports = {
  dataMap: {
    books: {},
    notes: {},
    tree: []
  },
  disposable: null,

  getBackupPath() {
    return inkdrop.config.get().core.db.backupPath;
  },

  getPlainTextPath(backupPath) {
    return `${backupPath || self.getBackupPath()}/PLAIN_TEXT`;
  },

  getDataMapPath(plainTextPath) {
    return `${plainTextPath || self.getPlainTextPath()}/.inkdrop_plain_text_backups/__DATA_MAP__.json`;
  },

  getNotePath() {},

  async getDataMap(plainTextPath) {
    return JSON.parse(await fs.promises.readFile(self.getDataMapPath(plainTextPath), "utf-8"));
  },

  async writeNote(notePath, body) {
    await fs.promises.mkdir(path.dirname(notePath), {
      recursive: true
    });
    await fs.promises.writeFile(notePath, body);
  },

  async getBookPath(disposable, doc) {
    let bookPath = doc.name;

    if (doc.parentBookId) {
      let hasParent = true;

      while (hasParent) {
        var parentBookData = await disposable.books.get(parentBookData ? parentBookData.parentBookId : doc.parentBookId);
        bookPath = `${parentBookData.name}/${bookPath}`;
        hasParent = Boolean(parentBookData.parentBookId);
      }
    }

    return bookPath;
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

        if (bookData) {
          let bookPath = await self.getBookPath(disposable, bookData);
          self.dataMap.books[doc.bookId] = bookPath;
          self.dataMap.notes[doc._id].path = `${bookPath}/${doc.title}.md`;
          await self.writeNote(`${plainTextPath}/${self.dataMap.notes[doc._id].path}`, doc.body);
        }
      }));

      if (self.dataMap) {
        resolve(self.dataMap);
      } else {
        reject(self);
      }
    });
  },

  getTree: (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
      const filePath = `${dirPath}/${file}`;

      if (fs.statSync(filePath).isDirectory()) {
        arrayOfFiles = self.getTree(filePath, arrayOfFiles);
      } else if (path.extname(file) === ".md") {
        arrayOfFiles.push(filePath);
      }
    });
    return arrayOfFiles;
  },

  async writeMaps(plainTextPath, maps) {
    maps.tree = self.getTree(plainTextPath);
    const dataMapPath = self.getDataMapPath(plainTextPath);
    await fs.promises.mkdir(path.dirname(dataMapPath), {
      recursive: true
    });
    await fs.promises.writeFile(dataMapPath, JSON.stringify(maps));
  },

  async importAll() {
    const plainTextPath = self.getPlainTextPath();
    const diskDataMap = await self.getDataMap(plainTextPath);
    self.disposable = self.disposable || inkdrop.main.dataStore.getLocalDB();
    const tree = self.getTree(plainTextPath);
    await Promise.all(Object.keys(diskDataMap.notes).map(async noteId => {
      const filePath = `${plainTextPath}/${diskDataMap.notes[noteId].path}`;
      const fileTreeIndex = tree.indexOf(filePath);

      if (fileTreeIndex > -1) {
        tree.splice(fileTreeIndex, 1);
      }

      const newBody = await fs.promises.readFile(filePath, "utf-8");

      try {
        const currentNote = await self.disposable.notes.get(noteId); // Don't bother if there are no changes:

        if (currentNote.body !== newBody) {
          await self.disposable.notes.put({
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
    })); // Remove 'Trash' files from the tree:

    const prunedTree = tree.filter(filePath => {
      return !new RegExp(`${plainTextPath}/undefined/`).test(filePath);
    });
    await Promise.all(prunedTree.map(async newNotePath => {
      const bookPathArray = path.dirname(newNotePath).replace(new RegExp(`^${plainTextPath}/`), "").split("/"); // This is a best guess because it uses the name,
      // if there is another notebook with the same
      // exact name this may return the
      // 'wrong' one.

      const bookDoc = await self.disposable.books.findWithName(bookPathArray.pop());

      if (bookDoc && bookDoc._id) {
        const newBody = await fs.promises.readFile(newNotePath, "utf-8");
        const newNoteId = self.disposable.notes.createId();
        await self.disposable.notes.put({
          _id: newNoteId,
          updatedAt: Date.now(),
          bookId: bookDoc._id,
          title: path.basename(newNotePath).replace(new RegExp(`${path.extname(newNotePath)}$`), ""),
          doctype: "markdown",
          createdAt: Date.now(),
          body: newBody
        });
      }
    }));
    await self.writeMaps(plainTextPath, self.dataMap);
  }

};
//# sourceMappingURL=utilities.js.map