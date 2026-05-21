import { useCallback, useEffect, useState } from "react";
import "./EasterEggCredits.css";

import secretSound from "../../../assets/sounds/universfield-video-game-bonus-323603.mp3";
import backgroundLoop from "../../../assets/sounds/freesound_community-8-bit-heaven-26287.mp3";

const EASTER_EGG_TRIGGER = "cabbage patch";
const HARVEST_MASTER_STORAGE_KEY = "harvestMasterUnlocked";

const GROUP_MEMBERS = [
    "Kelsen",
    "Finn",
    "David",
    "Donovan",
    "Andrew"
];

export function useEasterEgg() {
    const [showEasterEgg, setShowEasterEgg] = useState(false);
    const [hasUnlockedHarvestMaster, setHasUnlockedHarvestMaster] = useState(false);

    // Restore achievement badge if previously unlocked
    useEffect(() => {
        if (localStorage.getItem(HARVEST_MASTER_STORAGE_KEY) === "true") {
            setHasUnlockedHarvestMaster(true);
        }
    }, []);

    const triggerIfMatch = useCallback((searchText) => {
        if (searchText.trim().toLowerCase() !== EASTER_EGG_TRIGGER) {
            return;
        }

        localStorage.setItem(HARVEST_MASTER_STORAGE_KEY, "true");
        setHasUnlockedHarvestMaster(true);

        const easterEggAudio = new Audio(secretSound);
        const backgroundMusic = new Audio(backgroundLoop);
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;

        easterEggAudio.play();

        setTimeout(() => {
            backgroundMusic.play();
        }, 2500);

        setShowEasterEgg(true);

        setTimeout(() => {
            setShowEasterEgg(false);
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }, 13500);
    }, []);

    return { showEasterEgg, hasUnlockedHarvestMaster, triggerIfMatch };
}

function EasterEggCredits() {
    return (
        <div className="easter-egg-overlay">
            <div className="intro-message">
                SECRET HARVEST MODE ACTIVATED
            </div>
            {GROUP_MEMBERS.map((member) => (
                <h1 key={member} className="credits-name">
                    {member}
                </h1>
            ))}
        </div>
    );
}

export default EasterEggCredits;