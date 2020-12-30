import { promises as fs } from "fs";
import ImportSidebar from "./import_sidebar";
import ImportModal from "./import_modal";
import utilities from "./utilities";

module.exports = {
    disposable: null,
    async activate() {
        if (inkdrop && !inkdrop.isMobile) {
            const backupPath = utilities.getBackupPath();
            if (backupPath) {
                const plainTextPath = utilities.getPlainTextPath(backupPath);
                this.disposable = inkdrop.main.dataStore.getLocalDB();
                await utilities.getDataAndWriteAllNotes(
                    this.disposable,
                    plainTextPath
                );
                await utilities.writeMaps(plainTextPath, utilities.dataMap);

                inkdrop.components.registerClass(ImportSidebar);
                inkdrop.layouts.insertComponentToLayoutAfter(
                    ImportSidebar.layoutName,
                    "SideBarMenuItemTrash",
                    ImportSidebar.name
                );

                inkdrop.components.registerClass(ImportModal);
                inkdrop.layouts.addComponentToLayout(
                    ImportModal.layoutName,
                    ImportModal.name
                );

                // Sync stuff on changes:
                this.disposable.onChange(async (change) => {
                    try {
                        const typeOfChange = change.id.split(":")[0];

                        switch (typeOfChange) {
                            case "note":
                                const bookPath = `${plainTextPath}/${
                                    utilities.dataMap.books[change.doc.bookId]
                                }`;

                                // If the title has changed, rename the old note.
                                if (
                                    change?.doc?.title &&
                                    change.doc.title !==
                                        utilities.dataMap.notes[change.id].title
                                ) {
                                    const oldDataMap = await utilities.getDataMap(
                                        plainTextPath
                                    );

                                    await fs.rename(
                                        `${bookPath}/${
                                            oldDataMap.notes[change.id].title
                                        }.md`,
                                        `${bookPath}/${change.doc.title}.md`
                                    );
                                    utilities.dataMap.notes[change.id].title =
                                        change.doc.title;
                                }
                                await utilities.writeNote(
                                    `${bookPath}/${change.doc.title}.md`,
                                    change.doc.body
                                );
                                await utilities.writeMaps(
                                    plainTextPath,
                                    utilities.dataMap
                                );

                                break;
                            case "book":
                                if (
                                    change?.doc?.name &&
                                    change.doc.name !==
                                        utilities.dataMap.books[change.id]
                                ) {
                                    const oldDataMap = await utilities.getDataMap(
                                        plainTextPath
                                    );

                                    await fs.rename(
                                        `${plainTextPath}/${
                                            oldDataMap.books[change.id]
                                        }`,
                                        `${plainTextPath}/${change.doc.name}`
                                    );

                                    utilities.dataMap.books[change.id] =
                                        change.doc.name;

                                    await utilities.writeMaps(
                                        plainTextPath,
                                        utilities.dataMap
                                    );
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

            inkdrop.components.deleteClass(ImportSidebar);
            inkdrop.layouts.removeComponentFromLayout(
                ImportSidebar.layoutName,
                ImportSidebar.name
            );

            inkdrop.components.deleteClass(ImportModal);
            layouts.removeComponentFromLayout("modal", ImportModal.name);
        }
    },
};
