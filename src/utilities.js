import * as fs from "fs";
import * as path from "path";

const self = (module.exports = {
    dataMap: { books: {}, notes: {}, tree: [] },

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
            await fs.promises.readFile(
                self.getDataMapPath(plainTextPath),
                "utf-8"
            )
        );
    },

    async writeNote(notePath, body) {
        await fs.promises.mkdir(path.dirname(notePath), { recursive: true });
        await fs.promises.writeFile(notePath, body);
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
    treePaths: [],
    currentDir: "",
    async getTree(source) {
        const initialRead = await fs.promises.readdir(source, {
            withFileTypes: true,
        });

        return initialRead
            .filter((dirent) => {
                return (
                    dirent.isDirectory() ||
                    // We could support more than Markdown in the future.
                    (dirent.isFile() && /\.md$/.test(dirent.name))
                );
            })
            .map(async (dirent) => {
                if (dirent.isDirectory()) {
                    self.currentDir += dirent.name;
                    const subDirents = await Promise.all(
                        await self.getTree(path.join(source, dirent.name))
                    );
                    return {
                        directory: dirent.name,
                        children: subDirents,
                    };
                } else {
                    self.treePaths.push(`${self.currentDir}/${dirent.name}`);
                    self.currentDir = "";

                    return {
                        file: dirent.name,
                        exists: false,
                    };
                }
            });
    },
    getAllFiles: (dirPath, arrayOfFiles) => {
        const files = fs.readdirSync(dirPath);

        arrayOfFiles = arrayOfFiles || [];

        files.forEach(function (file) {
            const filePath = `${dirPath}/${file}`;
            if (fs.statSync(filePath).isDirectory()) {
                arrayOfFiles = self.getAllFiles(filePath, arrayOfFiles);
            } else if (/\.md$/.test(file)) {
                // arrayOfFiles.push(path.join(__dirname, dirPath, "/", file));
                arrayOfFiles.push(filePath);
            }
        });

        return arrayOfFiles;
    },
    async writeMaps(plainTextPath, maps) {
        maps.tree = await Promise.all(await self.getTree(plainTextPath));
        console.log(self.getAllFiles(plainTextPath));
        // console.log(self.treePaths);
        const dataMapPath = self.getDataMapPath(plainTextPath);
        await fs.promises.mkdir(path.dirname(dataMapPath), { recursive: true });

        await fs.promises.writeFile(dataMapPath, JSON.stringify(maps));
    },

    async importAll() {
        const plainTextPath = self.getPlainTextPath();
        const diskDataMap = await self.getDataMap(plainTextPath);
        const db = inkdrop.main.dataStore.getLocalDB();

        const tree = await Promise.all(await self.getTree(plainTextPath));
        // console.log(self.treePaths);

        await Promise.all(
            Object.keys(diskDataMap.notes).map(async (noteId) => {
                const newBody = await fs.promises.readFile(
                    `${plainTextPath}/${diskDataMap.notes[noteId].path}`,
                    "utf-8"
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
