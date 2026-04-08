// Source - https://stackoverflow.com/a
// Posted by Aurimas Gaidys
// Retrieved 2025-12-02, License - CC BY-SA 4.0

import { useEffect, useState } from "react";
import { Droppable } from "@hello-pangea/dnd";

const StrictModeDroppable = ({ children, ...props }) => {
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        const animation = requestAnimationFrame(() => setEnabled(true));
        return () => {
        cancelAnimationFrame(animation);
        setEnabled(false);
        };
    }, []);
    if (!enabled) {
        return null;
    }
    return <Droppable {...props}>{children}</Droppable>;
};

export { StrictModeDroppable as CustomDroppable };