"use babel";

import * as React from "react";
import RestoreModal from "./restore_modal";

// This has to be an 'old-school' function because
// it relies on the 'name' property.
class RestoreSidebar extends React.Component {
    static layoutName = "sidebar-menu";

    handleClick = () => {
        return <RestoreModal open={true} />;
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
