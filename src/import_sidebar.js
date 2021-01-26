"use babel";

import * as React from "react";

// This has to be an 'old-school' function because
// it relies on the 'name' property.
class ImportSidebar extends React.Component {
    static layoutName = "sidebar-menu";

    handleClick = () => {
        inkdrop.commands.dispatch(
            document.body,
            "plain_text_backups:toggle_dialog"
        );
    };

    render() {
        const { SideBarMenuItem } = inkdrop.components.classes;

        return (
            <SideBarMenuItem
                className="plain_text_backups__import_sidebar"
                indentLevel={0}
                onClick={this.handleClick}
                renderIcon={() => {
                    return <i className="redo icon" />;
                }}
            >
                Import Plain Text
            </SideBarMenuItem>
        );
    }
}

export default ImportSidebar;
