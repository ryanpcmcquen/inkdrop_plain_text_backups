import * as fs from "fs";

module.exports = {
    disposable: null,
    bookMap: {},
    noteMap: {},
    writeNote(path, title, body) {
        fs.mkdir(path, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
            fs.writeFile(`${path}/${title}.md`, body, (err) => {
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
            await Promise.all(
                await allNotes.docs.map(async (doc) => {
                    this.noteMap[doc._id] = doc.title;
                    const bookData = await this.disposable.books.get(
                        doc.bookId
                    );
                    this.bookMap[doc.bookId] = bookData.name;

                    this.writeNote(
                        `${plainTextPath}/${bookData.name}`,
                        doc.title,
                        doc.body
                    );
                })
            );

            resolve([this.bookMap, this.noteMap]);
        });
    },
    writeMaps(plainTextPath, maps) {
        fs.mkdir(plainTextPath, { recursive: true }, (err) => {
            if (err) {
                throw err;
            }
            fs.writeFile(
                `${plainTextPath}/.__DATA_MAP__.json`,
                JSON.stringify(maps),
                (err) => {
                    if (err) {
                        return console.log(err);
                    }
                }
            );
        });
    },
    async activate() {
        if (inkdrop && !inkdrop.isMobile) {
            const backupPath = inkdrop.config.get().core.db.backupPath;
            if (backupPath) {
                const plainTextPath = `${backupPath}/PLAIN_TEXT`;
                this.disposable = inkdrop.main.dataStore.getLocalDB();
                const maps = await this.getMapsAndWriteAllNotes(plainTextPath);
                this.writeMaps(plainTextPath, maps);
                // Sync stuff on changes:
                this.disposable.onChange((change) => {
                    try {
                        const typeOfChange = change.id.split(":")[0];

                        switch (typeOfChange) {
                            case "note":
                                const bookPath = `${plainTextPath}/${
                                    this.bookMap[change.doc.bookId]
                                }`;
                                this.writeNote(
                                    bookPath,
                                    change.doc.title,
                                    change.doc.body
                                );

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
    },
};
