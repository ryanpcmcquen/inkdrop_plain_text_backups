## v0.1.0 - First Release!

-   Makes plain text backups on db changes.

## v0.2.0 - Writes full backup on initial activation.

-   We are also storing some data maps which will help with renaming in the future.

## v0.3.0 - Renaming support!

-   Renaming notebooks and notes is now supported.
-   Lots of under the hood cleanup and async-ifying.

## v0.4.0 - Import support!

-   You can now import existing notes from your PLAIN_TEXT folder.

## v0.5.0 - Add support for sub notebooks!

-   Sub notebooks will now back up with correct paths.

## v0.6.0 - File creation inside of the PLAIN_TEXT folder works!

-   You can now create files inside of PLAIN_TEXT and they will be picked up by imports.
    -   Caveat: This utilizes the internal `findByName` to match Notebook names to folders, so if you have two notebooks of the same name, the imported note may not end up in the one you want.

## v0.7.0 - Moved or trashed files are now deleted from the PLAIN_TEXT directory.

-   This keeps a bunch of crufty files from floating around, but it does introduce the possibility of data loss. It has been tested here, but please report any issues.
