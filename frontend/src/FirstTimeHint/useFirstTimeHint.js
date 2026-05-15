import { useState, useEffect } from 'react';

export function useFirstTimeHint(storageKey) {
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        const isHidden = localStorage.getItem(storageKey) === 'true';
        if (!isHidden) {
            setShowHint(true);
        }
    }, [storageKey]);

    const dismissHint = () => {
        localStorage.setItem(storageKey, 'true');
        setShowHint(false);
    };

    return [showHint, dismissHint];
}