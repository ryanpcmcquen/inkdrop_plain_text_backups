"use strict";

var fs = _interopRequireWildcard(require("fs"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

module.exports = {
  disposable: null,

  activate() {
    if (inkdrop && !inkdrop.isMobile) {
      const backupPath = inkdrop.config.get().core.db.backupPath;

      if (backupPath) {
        this.disposable = inkdrop.main.dataStore.getLocalDB();
        this.disposable.onChange(change => {
          try {
            const typeOfChange = change.id.split(":")[0];

            switch (typeOfChange) {
              case "note":
                this.disposable.books.get(change.doc.bookId).then(bookData => {
                  const bookPath = `${backupPath}/PLAIN_TEXT/${bookData.name}`;
                  fs.mkdir(bookPath, {
                    recursive: true
                  }, err => {
                    if (err) {
                      throw err;
                    }

                    fs.writeFile(`${bookPath}/${change.doc.title}.md`, change.doc.body, err => {
                      if (err) {
                        return console.log(err);
                      }
                    });
                  });
                });
                break;
              // case "book":
              //     this.disposable.books
              //         .get(change.id)
              //         .then((bookData) => {
              //             debugger;
              //             // fs.rename("/tmp/hello", "/tmp/world", (err) => {
              //             //     if (err) throw err;
              //             //     console.log("renamed complete");
              //             // });
              //         });
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