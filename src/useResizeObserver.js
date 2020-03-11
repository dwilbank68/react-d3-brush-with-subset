import { useEffect, useState } from "react";
import ResizeObserver from "resize-observer-polyfill";

const useResizeObserver = ref => {
    const [dimensions, setDimensions] = useState(null);
    useEffect(() => {
        // called as soon as DOM is rendered, then every time dimensions changes
        const observeTarget = ref.current;
        const resizeObserver = new ResizeObserver(entries => {
            // entries = [   {contentRect: {height, width, etc} }   ]
            entries.forEach(entry => {
                setDimensions(entry.contentRect);
            });
        });
    resizeObserver.observe(observeTarget);
    return () => {
        resizeObserver.unobserve(observeTarget);
        // triggered when component is unmounted
    };
    }, [ref]);
    return dimensions; // {height, width}
};

export default useResizeObserver;