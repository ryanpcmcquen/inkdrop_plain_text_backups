import * as React from "react";
import { getPlainTextPath, restoreAll } from "./utilities";

class RestoreModal extends React.Component {
    dialog = null;
    open() {
        if (!this.dialog.isShown) {
            this.dialog.showDialog();
        }
    }

    render() {
        const { MessageDialog } = inkdrop.components.classes;

        return (
            <MessageDialog
                ref={(dia) => (this.dialog = dia)}
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
