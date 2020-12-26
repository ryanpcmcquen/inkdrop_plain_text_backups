import * as fs from "fs";

module.exports = {
    disposable: null,
    activate() {
        if (inkdrop && !inkdrop.isMobile) {
            const backupPath = inkdrop.config.get().core.db.backupPath;
            if (backupPath) {
                this.disposable = inkdrop.main.dataStore.getLocalDB();

                this.disposable.onChange((change) => {
                    try {
                        const typeOfChange = change.id.split(":")[0];

                        switch (typeOfChange) {
                            case "note":
                                this.disposable.books
                                    .get(change.doc.bookId)
                                    .then((bookData) => {
                                        const bookPath = `${backupPath}/PLAIN_TEXT/${bookData.name}`;
                                        fs.mkdir(
                                            bookPath,
                                            { recursive: true },
                                            (err) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                fs.writeFile(
                                                    `${bookPath}/${change.doc.title}.md`,
                                                    change.doc.body,
                                                    (err) => {
                                                        if (err) {
                                                            return console.log(
                                                                err
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        );
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
    },
};
