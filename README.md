# Inkdrop plain text backups

Plain text backups for Inkdrop.

For this plugin to function, you must have the Backup Path set in the Inkdrop desktop app.

Then, backups will be created under:

```
{{ BACKUP_PATH }}/PLAIN_TEXT/{{ NOTEBOOK_NAME }}/{{ NOTE_TITLE }}.md
```

A full backup is done on the initial app launch or activation, after that, changes are written using the database `onChange` event.

Now with renaming support!

![Renaming demo](assets/inkdrop_plain_text_backups_renaming_demo.gif)
