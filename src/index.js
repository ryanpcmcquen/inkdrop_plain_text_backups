import { promises as fs } from "fs";

module.exports = {
    disposable: null,
    dataMap: { books: {}, notes: {} },
    getDataMapPath: (plainTextPath) => {
        return `${plainTextPath}/.__DATA_MAP__.json`;
    },
    async writeNote(path, title, body) {
        await fs.mkdir(path, { recursive: true });
        await fs.writeFile(`${path}/${title}.md`, body);
    },
    async getDataAndWriteAllNotes(plainTextPath) {
        // Sync everything one time:
        const allNotes = await this.disposable.notes.all();

        return new Promise(async (resolve, reject) => {
            await Promise.all(
                await allNotes.docs.map(async (doc) => {
                    this.dataMap.notes[doc._id] = doc.title;
                    const bookData = await this.disposable.books.get(
                        doc.bookId
                    );
                    this.dataMap.books[doc.bookId] = bookData.name;

                    this.writeNote(
                        `${plainTextPath}/${bookData.name}`,
                        doc.title,
                        doc.body
                    );
                })
            );

            resolve(this.dataMap);
        });
    },
    async writeMaps(plainTextPath, maps) {
        await fs.mkdir(plainTextPath, { recursive: true });

        await fs.writeFile(
            this.getDataMapPath(plainTextPath),
            JSON.stringify(maps)
        );
    },
    async activate() {
        if (inkdrop && !inkdrop.isMobile) {
            const backupPath = inkdrop.config.get().core.db.backupPath;
            if (backupPath) {
                const plainTextPath = `${backupPath}/PLAIN_TEXT`;
                this.disposable = inkdrop.main.dataStore.getLocalDB();
                await this.getDataAndWriteAllNotes(plainTextPath);
                this.writeMaps(plainTextPath, this.dataMap);
                // Sync stuff on changes:
                this.disposable.onChange(async (change) => {
                    try {
                        const typeOfChange = change.id.split(":")[0];

                        switch (typeOfChange) {
                            case "note":
                                const bookPath = `${plainTextPath}/${
                                    this.dataMap.books[change.doc.bookId]
                                }`;

                                // If the title has changed, rename the old note.
                                if (
                                    change.doc.title !==
                                    this.dataMap.notes[change.id]
                                ) {
                                    const oldDataMap = JSON.parse(
                                        await fs.readFile(
                                            this.getDataMapPath(plainTextPath),
                                            "utf8"
                                        )
                                    );

                                    await fs.rename(
                                        `${bookPath}/${
                                            oldDataMap.notes[change.id]
                                        }.md`,
                                        `${bookPath}/${change.doc.title}.md`
                                    );
                                    this.dataMap.notes[change.id] =
                                        change.doc.title;
                                }
                                this.writeNote(
                                    bookPath,
                                    change.doc.title,
                                    change.doc.body
                                );
                                this.writeMaps(plainTextPath, this.dataMap);

                                break;
                            case "book":
                                debugger;
                                if (
                                    change.doc.name !==
                                    this.dataMap.books[change.id]
                                ) {
                                    const oldDataMap = JSON.parse(
                                        await fs.readFile(
                                            this.getDataMapPath(plainTextPath),
                                            "utf8"
                                        )
                                    );
                                    debugger;

                                    await fs.rename(
                                        `${plainTextPath}/${
                                            oldDataMap.books[change.id]
                                        }`,
                                        `${plainTextPath}/${
                                            this.dataMap.books[change.id]
                                        }`
                                    );
                                    this.dataMap.books[change.id] =
                                        change.doc.name;
                                }
                                break;
                        }
                    } catch (err) {
                        console.warn(
                            "Plain text backup may have had an issue:",
                            err
                        );
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
