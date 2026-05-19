import React, {useEffect, useState} from 'react';
import './FoodLocationPage.css';
import Button from '../TemplateButtons/Button';
import ScrollableList from '../TemplateScrollableLists/ScrollableList';
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint';
import { useFirstTimeHint } from '../FirstTimeHint/useFirstTimeHint';
import { NavBar, Footer } from '../NavbarAndFooter/sharedComponents';


const foods = [
    {
        name: "cherry tomato",
        foodId: 9873,
        locations: [
            {
                name: "Walmart",
                address: "3054 Hill St.",
                locationId: 204,
                reportedDates: [
                    {
                        found: true,
                        date: "22/05/2026",
                        userId: 123443
                    },
                    {
                        found: true,
                        date: "02/03/2026",
                        userId: null

                    }
                ]
            },
            {
                name: "SaveOnFoods",
                address: "5467 Mountain St.",
                locationId: 405,
                reportedDates: [
                    {
                        found: true,
                        date: "22/01/2026",
                        userId: 253443
                    },
                    {
                        found: true,
                        date: "02/05/2026",
                        userId: 43525

                    },
                    {
                        found: true,
                        date: "17/05/2026",
                        userId: null

                    }
                ]
            }
        ]
    }
]

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
                        key={location.locationId}
                        text={`${location.name} - ${location.address}`}
                        className="location-list-button"
                        onClick={() => onSelect(location)}
                        
                    />
                ))}
            </ScrollableList>
        </section>
    );
}

const FoodLocationPage = ({ onLogout, onBack, onLocationSelect, searchQuery }) => {
    const [showHints, onDisableHints] = useFirstTimeHint('cabbagepatch_filter_hint_hidden');
    const [searchResults, setSearchResults] = useState([])

    const fetchSearchResults = async () => {
        const cleanedQuery = searchQuery?.trim() || '';
        if (!cleanedQuery) {
            setSearchResults([])
            return
        }
        const response = await fetch(
            `http://localhost:3000/foodLocations?foodName=${cleanedQuery}`
        )
        const data = await response.json()
        setSearchResults(data)
        
    }

    // useEffect takes in code to run, and on what state changes this should happen
    // Both errors/warnings can be ignore this is just React being overly cautious
    useEffect(() => {
        console.log("Locations for: " + searchQuery)
        fetchSearchResults()
    }, [searchQuery])



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
                    locations={searchResults} 
                    onSelect={onLocationSelect} 
                />

                <Footer />
            </div>
        </main>
    );
};

export default FoodLocationPage;