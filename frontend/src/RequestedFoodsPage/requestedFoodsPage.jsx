import React from 'react';
import './requestedFoodsPage.css';
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
                onClick={() => console.log("Filter requested foods")}
            />
        </section>
    );
}

function RequestedFoodList({ items }) {
    return (
        <div className="location-list-section">
            <ScrollableList maxHeight="400px">
                {items.map((item, index) => (
                    <div key={index} className="requested-row">
                        <Button 
                            text={item.name} 
                            className="requested-item-btn" 
                            onClick={() => console.log(`Food: ${item.name}`)}
                        />
                        <Button 
                            text={item.location} 
                            className="requested-item-btn" 
                            onClick={() => console.log(`Location: ${item.location}`)}
                        />
                    </div>
                ))}
            </ScrollableList>
        </div>
    );
}

const RequestedFoodsPage = ({ onLogout, onBack }) => {
    const [showHints, onDisableHints] = useFirstTimeHint('cabbagepatch_requested_hint_hidden');

    const requestedItems = [
        { name: "Cabbage", location: "Location #1" },
        { name: "Carrots", location: "Location #2" },
        { name: "Kale", location: "Location #3" },
        { name: "Spinach", location: "Location #4" },
        { name: "Broccoli", location: "Location #5" },
        { name: "Lettuce", location: "Location #6" },
    ];

    return (
        <main className="main-page-wrapper">
            <p className="page-context-title">Commonly Requested</p>
            <div className="main-card wide-card">
                <NavBar onBack={onBack} onLogout={onLogout} />

                {showHints && (
                    <FirstTimeHint 
                        title="Community Requests"
                        message="These are items users have requested. You can filter them to see what's most needed in your specific area!"
                        onDismiss={onDisableHints}
                    />
                )}

                <FilterSection />

                <RequestedFoodList items={requestedItems} />

                <Footer />
            </div>
        </main>
    );
};

export default RequestedFoodsPage;