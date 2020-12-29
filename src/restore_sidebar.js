"use babel";

import * as React from "react";
import { restoreAll } from "./utilities";

// This has to be an 'old-school' function because
// it relies on the 'name' property.
function RestoreSidebar() {
    const { SideBarMenuItem } = inkdrop.components.classes;

    const handleClick = async () => {
        await restoreAll();
    };

    return (
        <SideBarMenuItem
            className="plain_text_backups__restore_sidebar"
            indentLevel={0}
            onClick={handleClick}
            renderIcon={() => {
                return <i className="redo icon" />;
            }}
        >
            RESTORE ALL
        </SideBarMenuItem>
    );
}

const layoutName = "sidebar-menu";
const componentName = RestoreSidebar.name;

export default RestoreSidebar;
export { layoutName, componentName };
