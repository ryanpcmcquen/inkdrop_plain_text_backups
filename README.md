# Inkdrop plain text backups

Plain text backups for Inkdrop.

For this plugin to function, you must have the Backup Path set in the Inkdrop desktop app.

Then, backups will be created under:

```
{{ BACKUP_PATH }}/PLAIN_TEXT/{{ NOTEBOOK_NAME }}/{{ NOTE_TITLE }}.md
```

A full sync is done on the initial activation, after that, changes are written using the database `onChange` event.
