import React from 'react';
import './FoodLocationPage.css';
import Button from '../TemplateButtons/Button';
import ScrollableList from '../TemplateScrollableLists/ScrollableList';
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint';
import { useFirstTimeHint } from '../FirstTimeHint/useFirstTimeHint';
import { NavBar, Footer } from '../NavbarAndFooter/sharedComponents';

function FilterSection() {
    return (
        <section className="filter-section">
            <Button
                text="Filter"
                className="filter-button-main"
                onClick={() => console.log("User is now checking the possible filters")}
            />
        </section>
    );
}

function LocationListSection({ locations, onSelect }) {
    return (
        <section className="location-list-section">
            <ScrollableList maxHeight="350px">
                {locations.map((location, index) => (
                    <Button
                        key={index}
                        text={location}
                        className="location-list-button"
                        onClick={() => onSelect(loc)}
                    />
                ))}
            </ScrollableList>
        </section>
    );
}

const FoodLocationPage = ({ onLogout, onBack, onSelectLocation }) => {
    const [showHints, onDisableHints] = useFirstTimeHint('cabbagepatch_filter_hint_hidden');

    const locations = [
        "Location #1", "Location #2", "Location #3", "Location #4", 
        "Location #5", "Location #6", "Location #7", "Location #8", 
        "Location #9", "Location #10", "Location #11", "Location #12"
    ];

    return (
        <main className="main-page-wrapper">
            <p className="page-context-title">Available Locations</p>
            <div className="main-card wide-card">
                <NavBar onBack={onBack} onLogout={onLogout} />

                {showHints && (
                    <FirstTimeHint 
                        title="Finding the best spot"
                        message="Check out the filters to sort based on your preference such as distance or based on recent reports!"
                        onDismiss={onDisableHints}
                    />
                )}

                <FilterSection />

                <LocationListSection 
                    locations={locations} 
                    onSelect={onSelectLocation} 
                />

                <Footer />
            </div>
        </main>
    );
};

export default FoodLocationPage;