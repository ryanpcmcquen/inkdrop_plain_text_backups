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
        return `${plainTextPath || self.getPlainTextPath()}/.__DATA_MAP__.json`;
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
                    if (bookData && bookData?.name) {
                        self.dataMap.books[doc.bookId] = bookData.name;
                        self.dataMap.notes[
                            doc._id
                        ].path = `${plainTextPath}/${bookData.name}/${doc.title}.md`;

                        await self.writeNote(
                            self.dataMap.notes[doc._id].path,
                            doc.body
                        );
                    }
                })
            );

            resolve(self.dataMap);
        });
    },
    async writeMaps(plainTextPath, maps) {
        await fs.mkdir(plainTextPath, { recursive: true });

        await fs.writeFile(
            self.getDataMapPath(plainTextPath),
            JSON.stringify(maps)
        );
    },

    async restoreAll() {
        const plainTextPath = self.getPlainTextPath();
        const diskDataMap = await self.getDataMap(plainTextPath);
        const db = inkdrop.main.dataStore.getLocalDB();

        await Promise.all(
            await Object.keys(diskDataMap.notes).map(async (noteId) => {
                const newBody = await fs.readFile(
                    diskDataMap.notes[noteId].path,
                    "utf8"
                );
                try {
                    const currentNote = await db.notes.get(noteId);
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
                        `${noteId} restore from plain text failed!`,
                        err
                    );
                }
            })
        );

        db.dispose();
    },
});
