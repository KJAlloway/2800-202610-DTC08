// import React from 'react';
import './FoodLocationPage.css'
import ScrollableList from '../TemplateScrollableLists/ScrollableList'
import Button from '../TemplateButtons/Button'
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint'
import BackButton from '../BackButtonTemplate/BackButton'
import PageLabel from '../PageLabel/PageLabel'
import cabbageLogo from '../assets/cabbage-logo.svg'

const FoodLocationPage = ({
                              onLogout,
                              onBack,
                              showHints,
                              onDisableHints,
                              searchedFoodName,
                          }) => {
    const locations = [
        'Location #1',
        'Location #2',
        'Location #3',
        'Location #4',
        'Location #5',
        'Location #6',
        'Location #7',
        'Location #8',
        'Location #9',
        'Location #10',
        'Location #11',
        'Location #12',
    ]

    // Creates a small line of text showing what was searched.
    const searchSummary = searchedFoodName
        ? `Results for: ${searchedFoodName}`
        : 'Browse available locations below.'

    return (
        <div className="main-page-wrapper">
            <PageLabel text="Food Locations" />

            <div className="main-card">
                <div className="main-header">
                    <div className="header-left">
                        <div className="logo-nav-stack">
                            <div className="brand-outer-frame">
                                <div className="brand-inner-tray">
                                    <img
                                        src={cabbageLogo}
                                        alt="Logo"
                                        className="brand-logo"
                                    />
                                </div>
                            </div>

                            <BackButton onClick={onBack} />
                        </div>

                        <div className="brand-text-outer">
                            <div className="brand-text-tray">
                                <div className="brand-name-stacked">
                                    <span>Cabbage</span>
                                    <span>Patch</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        text="Log out"
                        onClick={onLogout}
                        className="logout-button-override"
                    />
                </div>

                {/* Shows the last search term that was submitted from MainPage */}
                <p className="food-location-search-summary">{searchSummary}</p>

                {showHints && (
                    <FirstTimeHint
                        title="Using the list"
                        message="Scroll through the locations or filter them to get the type of location you want."
                        onDismiss={onDisableHints}
                    />
                )}

                <div className="filter-section">
                    <Button
                        text="Filter"
                        className="filter-button-main"
                        onClick={() => console.log('Filter clicked')}
                    />
                </div>

                <div className="location-list-section">
                    <ScrollableList maxHeight="350px">
                        {locations.map((loc, index) => (
                            <Button
                                key={index}
                                text={loc}
                                className="location-list-button"
                                onClick={() => console.log(`Selected: ${loc}`)}
                            />
                        ))}
                    </ScrollableList>
                </div>

                <div className="main-card-footer">
                    <p>Copyright DTC-08</p>
                    <p>2026</p>
                </div>
            </div>
        </div>
    )
}

export default FoodLocationPage
