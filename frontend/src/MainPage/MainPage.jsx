import React from 'react'
import './MainPage.css'
import Button from '../TemplateButtons/Button'
import SearchBar from '../SearchBar/SearchBar'
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint';
import BackButton from '../BackButtonTemplate/BackButton';
import cabbageLogo from '../assets/cabbage-logo.svg'

function MainPage({
    onLogout,
    onBack,
    onOpenRequestPage,
    onOpenRequestedFoodsPage,
    showHints,
    onDisableHints
}) {
    const currentYear = new Date().getFullYear()

    const handleLogoutClick = () => {
        if (onLogout) onLogout();
        else console.log('Logout clicked');
    }

    const handleOpenRequestPage = () => {
        if (onOpenRequestPage) onOpenRequestPage();
        else console.log('Open request food page');
    }

    const handleOpenRequestedFoodsPage = () => {
        if (onOpenRequestedFoodsPage) onOpenRequestedFoodsPage();
        else console.log('Open requested foods list page');
    }

    return (
        <main className="main-page-wrapper">
            <p className="page-context-title">Main Page</p>

            <section className="main-card">
                <header className="main-header">
                    <div className="header-left">
                        <div className="logo-nav-stack">
                            <div className="brand-outer-frame">
                                <div className="brand-inner-tray">
                                    <img src={cabbageLogo} alt="Logo" className="brand-logo" />
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

                    <div className="header-right">
                        <Button
                            text="Log out"
                            className="logout-btn"
                            onClick={handleLogoutClick}
                        />
                    </div>
                </header>

                {showHints && (
                    <FirstTimeHint 
                        title="Welcome to the main menu!" 
                        message="Search for any food item or click below to submit a new request."
                        onDismiss={onDisableHints}
                    />
                )}

                <section className="search-section">
                    <SearchBar placeholder="Search for any food..." />
                </section>

                <section className="action-section">
                    <Button
                        text="Submit a request for unavailable food"
                        className="full-width-action"
                        onClick={handleOpenRequestPage}
                    />

                    <Button
                        text="View local commonly requested foods"
                        className="full-width-action"
                        onClick={handleOpenRequestedFoodsPage}
                    />
                </section>

                <footer className="main-card-footer">
                    <div className="footer-line"></div>
                    <p>Copyright DTC-08</p>
                    <p className="footer-year">{currentYear}</p>
                </footer>
            </section>
        </main>
    )
}

export default MainPage