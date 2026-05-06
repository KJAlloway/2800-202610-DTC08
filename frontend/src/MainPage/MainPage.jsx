import React from 'react';
import './MainPage.css';
import Button from '../TemplateButtons/Button';
import SearchBar from '../SearchBar/SearchBar';
import cabbageLogo from '../assets/cabbage-logo.svg';

function MainPage() {
    const currentYear = new Date().getFullYear();

    return (
        <main className="main-page-wrapper">
            <p className="page-context-title">Main Page</p>

            <section className="main-card">
                <header className="main-header">
                    <div className="header-left">
                        <div className="brand-outer-frame">
                            <div className="brand-inner-tray">
                                <img
                                    src={cabbageLogo}
                                    alt="Logo"
                                    className="brand-logo"
                                />
                            </div>
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
                            onClick={() => console.log("Logout")}
                        />
                    </div>
                </header>

                <section className="search-section">
                    <SearchBar
                        placeholder="Search for any food..."
                    />
                </section>

                <section className="action-section">
                    <Button
                        text="Submit a request for unavailable food"
                        className="full-width-action"
                    />
                    <Button
                        text="View local commonly requested foods"
                        className="full-width-action"
                    />
                </section>

                <footer className="main-card-footer">
                    <div
                        className="footer-line">
                    </div>
                    <p>Copyright DTC-08</p>
                    <p
                        className="footer-year">{currentYear}
                    </p>
                </footer>
            </section>
        </main>
    );
}

export default MainPage;