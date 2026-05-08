<<<<<<< HEAD
import React from 'react'
import './MainPage.css'
import Button from '../TemplateButtons/Button'
import SearchBar from '../SearchBar/SearchBar'
import cabbageLogo from '../assets/cabbage-logo.svg'

function MainPage({
                      onLogout,
                      onOpenRequestPage,
                      onOpenRequestedFoodsPage,
                  }) {
    // Gets the current year automatically for the footer.
    const currentYear = new Date().getFullYear()

    // Runs when the user clicks the logout button.
    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout()
            return
        }

        console.log('Logout clicked')
    }

    // Opens the page where the user can request a food item.
    const handleOpenRequestPage = () => {
        if (onOpenRequestPage) {
            onOpenRequestPage()
            return
        }

        console.log('Open request food page')
    }

    // Placeholder for the "commonly requested foods" page.
    const handleOpenRequestedFoodsPage = () => {
        if (onOpenRequestedFoodsPage) {
            onOpenRequestedFoodsPage()
            return
        }

        console.log('Open requested foods list page')
    }
=======
import React from 'react';
import './MainPage.css';
import Button from '../TemplateButtons/Button';
import SearchBar from '../SearchBar/SearchBar';
import cabbageLogo from '../assets/cabbage-logo.svg';

function MainPage() {
    const currentYear = new Date().getFullYear();
>>>>>>> 677c910dda0f367d0e6b5c9412150d80e53a3e06

    return (
        <main className="main-page-wrapper">
            <p className="page-context-title">Main Page</p>

            <section className="main-card">
                <header className="main-header">
                    <div className="header-left">
<<<<<<< HEAD
                        {/* Logo frame */}
=======
>>>>>>> 677c910dda0f367d0e6b5c9412150d80e53a3e06
                        <div className="brand-outer-frame">
                            <div className="brand-inner-tray">
                                <img
                                    src={cabbageLogo}
                                    alt="Logo"
                                    className="brand-logo"
                                />
                            </div>
                        </div>
<<<<<<< HEAD

                        {/* App name frame */}
=======
>>>>>>> 677c910dda0f367d0e6b5c9412150d80e53a3e06
                        <div className="brand-text-outer">
                            <div className="brand-text-tray">
                                <div className="brand-name-stacked">
                                    <span>Cabbage</span>
                                    <span>Patch</span>
                                </div>
                            </div>
                        </div>
                    </div>
<<<<<<< HEAD

=======
>>>>>>> 677c910dda0f367d0e6b5c9412150d80e53a3e06
                    <div className="header-right">
                        <Button
                            text="Log out"
                            className="logout-btn"
<<<<<<< HEAD
                            onClick={handleLogoutClick}
=======
                            onClick={() => console.log("Logout")}
>>>>>>> 677c910dda0f367d0e6b5c9412150d80e53a3e06
                        />
                    </div>
                </header>

<<<<<<< HEAD
                {/* Search area */}
                <section className="search-section">
                    <SearchBar text="Search for any food" />
                </section>

                {/* Main action buttons */}
=======
                <section className="search-section">
                    <SearchBar
                        placeholder="Search for any food..."
                    />
                </section>

>>>>>>> 677c910dda0f367d0e6b5c9412150d80e53a3e06
                <section className="action-section">
                    <Button
                        text="Submit a request for unavailable food"
                        className="full-width-action"
<<<<<<< HEAD
                        onClick={handleOpenRequestPage}
                    />

                    <Button
                        text="View local commonly requested foods"
                        className="full-width-action"
                        onClick={handleOpenRequestedFoodsPage}
                    />
                </section>

                {/* Footer */}
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
=======
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
>>>>>>> 677c910dda0f367d0e6b5c9412150d80e53a3e06
