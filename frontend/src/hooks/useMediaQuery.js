import { useState, useEffect } from "react";

export const DESKTOP_BREAKPOINT = "(min-width: 800px)";
export const DESKTOP_DRAWER_WIDTH = 450;

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handler = (event) => setMatches(event.matches);
        mediaQuery.addEventListener("change", handler);
        return () => mediaQuery.removeEventListener("change", handler);
    }, [query]);

    return matches;
}