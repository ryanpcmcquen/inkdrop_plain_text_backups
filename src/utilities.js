import { promises as fs } from "fs";
import * as path from "path";

const self = (module.exports = {
    dataMap: { books: {}, notes: {} },

    getBackupPath() {
        return inkdrop.config.get().core.db.backupPath;
    },
    getPlainTextPath(backupPath) {
        return `${backupPath || self.getBackupPath()}/PLAIN_TEXT`;
    },
    getDataMapPath(plainTextPath) {
        return `${
            plainTextPath || self.getPlainTextPath()
        }/.inkdrop_plain_text_backups/__DATA_MAP__.json`;
    },
    getNotePath() {},

    async getDataMap(plainTextPath) {
        return JSON.parse(
            await fs.readFile(self.getDataMapPath(plainTextPath), "utf8")
        );
    },

    async writeNote(notePath, body) {
        await fs.mkdir(path.dirname(notePath), { recursive: true });
        await fs.writeFile(notePath, body);
    },
    async getBookPath(disposable, doc) {
        let bookPath = doc.name;
        if (doc.parentBookId) {
            let hasParent = true;
            while (hasParent) {
                var parentBookData = await disposable.books.get(
                    parentBookData
                        ? parentBookData.parentBookId
                        : doc.parentBookId
                );
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
            await Promise.all(
                await allNotes.docs.map(async (doc) => {
                    if (!self.dataMap.notes[doc._id]) {
                        self.dataMap.notes[doc._id] = {};
                    }
                    self.dataMap.notes[doc._id].title = doc.title;

                    const bookData = await disposable.books.get(doc.bookId);

                    if (bookData) {
                        let bookPath = await self.getBookPath(
                            disposable,
                            bookData
                        );

                        self.dataMap.books[doc.bookId] = bookPath;
                        self.dataMap.notes[
                            doc._id
                        ].path = `${bookPath}/${doc.title}.md`;

                        await self.writeNote(
                            `${plainTextPath}/${
                                self.dataMap.notes[doc._id].path
                            }`,
                            doc.body
                        );
                    }
                })
            );
            if (self.dataMap) {
                resolve(self.dataMap);
            } else {
                reject(self);
            }
        });
    },
    async writeMaps(plainTextPath, maps) {
        const dataMapPath = self.getDataMapPath(plainTextPath);
        await fs.mkdir(path.dirname(dataMapPath), { recursive: true });

        await fs.writeFile(dataMapPath, JSON.stringify(maps));
    },

    async importAll() {
        const plainTextPath = self.getPlainTextPath();
        const diskDataMap = await self.getDataMap(plainTextPath);
        const db = inkdrop.main.dataStore.getLocalDB();

        // let allDirectories = [];
        // const getDirectories = async (baseDir) => {
        //     console.log(baseDir);
        //     const directories = await fs.readdir(baseDir, {
        //         withFileTypes: true,
        //     });
        //     console.log(directories);
        //     debugger;
        //     await Promise.all(
        //         directories.map(async (dir) => {
        //             allDirectories.push(
        //                 await getDirectories(path.join(baseDir, dir.name))
        //             );
        //         })
        //     );
        //     console.log(allDirectories);
        //     debugger;

        //     // const allDirectories = directories
        //     //     .filter((dir) => dir.isDirectory())
        //     //     .map((dir) => {
        //     //         const dirPath = path.join(baseDir, dir.name);
        //     //         // const relativePath = path.join(base, file.name);
        //     //         // debugger;
        //     //         // console.log("dirs:");
        //     //         // console.log(dirs);
        //     //         if (dir.isDirectory()) {
        //     //             return getDirectories(dirPath);
        //     //         } else {
        //     //             return dirPath;
        //     //         }
        //     //         //  else if (file.isFile()) {
        //     //         //     file.__fullPath = filePath;
        //     //         //     // file.__relateivePath = relativePath;
        //     //         //     return files.concat(file);
        //     //         // }
        //     //     });
        //     // console.log(allDirectories);
        //     return allDirectories;
        // };

        // const getDirectories = async (source) => {
        //     const allDirectories = await fs.readdir(source, {
        //         withFileTypes: true,
        //     });

        //     return allDirectories
        //         .filter((dirent) => dirent.isDirectory())
        //         .map((dirent) => dirent.name);
        // };
        // const allDirectories = await getDirectories(plainTextPath);
        // console.log(allDirectories);

        const dirs = async (sourcePath) => {
            let dirs = [];
            for (const file of await fs.readdir(sourcePath)) {
                if (
                    (await fs.stat(path.join(sourcePath, file))).isDirectory()
                ) {
                    dirs = [...dirs, file];
                }
            }
            return dirs;
        };
        console.log(await dirs(plainTextPath));
        debugger;

        await Promise.all(
            Object.keys(diskDataMap.notes).map(async (noteId) => {
                const newBody = await fs.readFile(
                    `${plainTextPath}/${diskDataMap.notes[noteId].path}`,
                    "utf8"
                );

                try {
                    const currentNote = await db.notes.get(noteId);

                    // Don't bother if there are no changes:
                    if (currentNote.body !== newBody) {
                        await db.notes.put({
                            _id: noteId,
                            _rev: currentNote._rev,
                            updatedAt: Date.now(),
                            bookId: currentNote.bookId,
                            title: currentNote.title,
                            doctype: currentNote.doctype,
                            createdAt: currentNote.createdAt,

                            body: newBody,
                        });
                    }
                } catch (err) {
                    console.warn(
                        `${noteId} import from plain text failed!`,
                        err
                    );
                }
            })
        );

        db.dispose();
    },
});
