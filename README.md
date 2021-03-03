# Inkdrop plain text backups

Plain text backups and import for Inkdrop.

For this plugin to function, you must have the Backup Path set in the Inkdrop desktop app.

Then, backups will be created under:

```
{{ BACKUP_PATH }}/PLAIN_TEXT/{{ NOTEBOOK_NAME }}/{{ NOTE_TITLE }}.md
```

A full backup is done on the initial app launch or activation, after that, changes are written using the database `onChange` event.

Now with renaming support!

![Renaming demo](assets/inkdrop_plain_text_backups_renaming_demo.gif)

And import support!

![Import demo](assets/inkdrop_plain_text_backups_import_demo.gif)

And note creation support!

![Note creation demo](assets/inkdrop_plain_text_backups_note_creation_demo.gif)

## Known limitations:

-   **Inkdrop must be running before modification** of files in the `PLAIN_TEXT` directory, because all notes are backed up on app launch.
-   Renaming of files or folders inside of the `PLAIN_TEXT` directory is not supported at this time, please rename inside of Inkdrop.
-   Note creation inside of the `PLAIN_TEXT` directory is now supported! But, Notebooks are matched to files using `findByName`, which could result in the external note being imported into the wrong Notebook _if_ you have multiple Notebooks of the same name. Also, creating folders inside of the `PLAIN_TEXT` directory will not create Notebooks.
-   Moving and deleting files will delete files inside of the `PLAIN_TEXT` directory as of `0.7.0`. This has been tested but please report any issues related to data loss.
