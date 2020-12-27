"use strict";

var fs = _interopRequireWildcard(require("fs"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

module.exports = {
  disposable: null,
  bookMap: {},
  noteMap: {},

  writeNote(path, title, body) {
    fs.mkdir(path, {
      recursive: true
    }, err => {
      if (err) {
        throw err;
      }

      fs.writeFile(`${path}/${title}.md`, body, err => {
        if (err) {
          return console.log(err);
        }
      });
    });
  },

  async getMapsAndWriteAllNotes(plainTextPath) {
    // Sync everything one time:
    const allNotes = await this.disposable.notes.all();
    return new Promise(async (resolve, reject) => {
      await Promise.all(await allNotes.docs.map(async doc => {
        this.noteMap[doc._id] = doc.title;
        const bookData = await this.disposable.books.get(doc.bookId);
        this.bookMap[doc.bookId] = bookData.name;
        this.writeNote(`${plainTextPath}/${bookData.name}`, doc.title, doc.body);
      }));
      resolve([this.bookMap, this.noteMap]);
    });
  },

  writeMaps(plainTextPath, maps) {
    fs.mkdir(plainTextPath, {
      recursive: true
    }, err => {
      if (err) {
        throw err;
      }

      fs.writeFile(`${plainTextPath}/.__DATA_MAP__.json`, JSON.stringify(maps), err => {
        if (err) {
          return console.log(err);
        }
      });
    });
  },

  async activate() {
    if (inkdrop && !inkdrop.isMobile) {
      const backupPath = inkdrop.config.get().core.db.backupPath;

      if (backupPath) {
        const plainTextPath = `${backupPath}/PLAIN_TEXT`;
        this.disposable = inkdrop.main.dataStore.getLocalDB();
        const maps = await this.getMapsAndWriteAllNotes(plainTextPath);
        this.writeMaps(plainTextPath, maps); // Sync stuff on changes:

        this.disposable.onChange(change => {
          try {
            const typeOfChange = change.id.split(":")[0];

            switch (typeOfChange) {
              case "note":
                const bookPath = `${plainTextPath}/${this.bookMap[change.doc.bookId]}`;
                this.writeNote(bookPath, change.doc.title, change.doc.body);
                break;
              // case "book":
              //     fs.rename("/tmp/hello", "/tmp/world", (err) => {
              //         if (err) throw err;
              //         console.log("renamed complete");
              //     });
              //     break;
            }
          } catch (err) {
            console.warn("Plain text backup failed:", err);
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
    }
  }

};