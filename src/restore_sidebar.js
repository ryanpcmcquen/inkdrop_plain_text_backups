"use babel";

import * as React from "react";
import RestoreModal from "./restore_modal";

// import { getPlainTextPath, restoreAll } from "./utilities";

// const { MessageDialog, SideBarMenuItem } = inkdrop.components.classes;

// const Modal = function (props) {
//     const { MessageDialog } = inkdrop.components.classes;
//     console.log("hey");
//     return (
//         <MessageDialog
//             modalSettings={{ closable: false, autofocus: true }}
//             open={props.open}
//             title={() => (
//                 <span>
//                     <i className="redo icon" />
//                     Restore from plain text backups?
//                 </span>
//             )}
//             buttons={[
//                 { label: "No", cancel: true },
//                 { label: "Yes", primary: true },
//             ]}
//             onDismiss={async (caller, buttonIndex) => {
//                 debugger;
//                 if (buttonIndex === 1) {
//                     // User confirms restoration:
//                     await restoreAll();
//                 } else {
//                     // User rejects restoration:
//                     return true;
//                 }
//             }}
//         >
//             <p>
//                 Are you sure you want to restore from your plain text notes (
//                 {getPlainTextPath()})?
//             </p>
//         </MessageDialog>
//     );
// };

// This has to be an 'old-school' function because
// it relies on the 'name' property.
class RestoreSidebar extends React.Component {
    static layoutName = "sidebar-menu";
    static componentName = this.name;
    // state = { modalIsOpen: false };
    // constructor(props) {
    //     super(props);
    //     this.state = { modalIsOpen: false };
    // }

    handleClick = () => {
        RestoreModal.open();
        // this.setState({ modalIsOpen: !this.state.modalIsOpen });
    };

    render() {
        const { SideBarMenuItem } = inkdrop.components.classes;

        return (
            <SideBarMenuItem
                className="plain_text_backups__restore_sidebar"
                indentLevel={0}
                onClick={this.handleClick}
                renderIcon={() => {
                    return <i className="redo icon" />;
                }}
            >
                OVERWRITE
            </SideBarMenuItem>
        );
    }
}

export default RestoreSidebar;
