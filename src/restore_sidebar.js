"use babel";

import * as React from "react";
import { logger } from "inkdrop";

// This has to be an 'old-school' function because
// it relies on the 'name' property.
function RestoreSidebar() {
    const { SideBarMenuItem } = inkdrop.components.classes;

    const handleClick = () => {
        logger.debug("Clicked!");
    };
    // debugger;

    return (
        <SideBarMenuItem
            className="plain_text_backups__restore_sidebar"
            indentLevel={0}
            onClick={handleClick}
            renderIcon={() => <i className="warning icon" />}
        >
            Restore Backups
        </SideBarMenuItem>
    );
}

const layoutName = "sidebar-menu";
const componentName = RestoreSidebar.name;

const toggle = () => {
    const isVisible =
        inkdrop.layouts.indexOfComponentInLayout(layoutName, componentName) >=
        0;
    isVisible ? hide() : show();
};

const hide = () => {
    inkdrop.layouts.removeComponentFromLayout(layoutName, this.componentName);
};

const show = () => {
    inkdrop.layouts.insertComponentToLayoutAfter(
        layoutName,
        "SideBarMenuItemTrash",
        componentName
    );
};

export default RestoreSidebar;
export { toggle, hide, show, layoutName, componentName };
