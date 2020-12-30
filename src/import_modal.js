import * as React from "react";
import { getPlainTextPath, importAll } from "./utilities";
import { CompositeDisposable } from "event-kit";

class ImportModal extends React.Component {
    static layoutName = "modal";
    subscriptions = new CompositeDisposable();

    constructor(props) {
        super(props);

        // Register command that toggles this dialog:
        this.subscriptions.add(
            inkdrop.commands.add(document.body, {
                "plain_text_backups:toggle_dialog": this.toggle,
            })
        );
    }

    toggle = () => {
        const { dialogRef } = this;
        if (!dialogRef.isShown) {
            dialogRef.showDialog();
        } else {
            dialogRef.dismissDialog();
        }
    };

    componentWillUnmount() {
        this.subscriptions.dispose();
    }

    render() {
        const { MessageDialog } = inkdrop.components.classes;

        return (
            <MessageDialog
                ref={(el) => {
                    return (this.dialogRef = el);
                }}
                modalSettings={{ closable: false, autofocus: true }}
                title={() => (
                    <span>
                        <i className="redo icon" />
                        Import from plain text backups?
                    </span>
                )}
                buttons={[
                    { label: "No", cancel: true },
                    { label: "Yes", primary: true },
                ]}
                onDismiss={async (caller, buttonIndex) => {
                    if (buttonIndex === 1) {
                        // User confirms restoration:
                        await importAll();
                    } else {
                        // User rejects restoration:
                        return true;
                    }
                }}
            >
                <p>
                    Are you sure you want to import from your plain text notes?
                    <br />
                    <br />
                    Located at: <code>{getPlainTextPath()}</code>
                    <br />
                    <br />
                    <strong>WARNING:</strong> This will overwrite existing data
                    with data from your plain text notes and COULD RESULT IN
                    DATA LOSS.
                </p>
            </MessageDialog>
        );
    }
}

export default ImportModal;
