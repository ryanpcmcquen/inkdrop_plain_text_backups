import * as React from "react";
import { getPlainTextPath, restoreAll } from "./utilities";
import { CompositeDisposable } from "event-kit";

class RestoreModal extends React.Component {
    static layoutName = "modal";
    subscriptions = new CompositeDisposable();

    constructor(props) {
        super(props);

        this.open = false;
        // Register command that toggles this dialog
        this.subscriptions.add(
            inkdrop.commands.add(document.body, {
                "plain_text_backups:toggle-dialog": this.toggle,
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
    // open() {
    // if (!this?.dialog?.isShown) {
    // this?.dialog?.showDialog();
    // }
    // }

    render() {
        const { MessageDialog } = inkdrop.components.classes;
        debugger;
        if (this.props.open) {
            this.showDialog();
        }
        return (
            <MessageDialog
                ref={(el) => {
                    return (this.dialogRef = el);
                }}
                modalSettings={{ closable: false, autofocus: true }}
                title={() => (
                    <span>
                        <i className="redo icon" />
                        Restore from plain text backups?
                    </span>
                )}
                buttons={[
                    { label: "No", cancel: true },
                    { label: "Yes", primary: true },
                ]}
                onDismiss={async (caller, buttonIndex) => {
                    debugger;
                    if (buttonIndex === 1) {
                        // User confirms restoration:
                        await restoreAll();
                    } else {
                        // User rejects restoration:
                        return true;
                    }
                }}
            >
                <p>
                    Are you sure you want to restore from your plain text notes
                    ({getPlainTextPath()})?
                </p>
            </MessageDialog>
        );
    }
}

export default RestoreModal;
