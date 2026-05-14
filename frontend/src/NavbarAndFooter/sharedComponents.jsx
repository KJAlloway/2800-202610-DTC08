import React from 'react';
import './sharedComponents.css'
import BackButton from '../BackButtonTemplate/BackButton';
import Button from '../TemplateButtons/Button';
import cabbageLogo from '../assets/cabbage-logo.svg';

export function NavBar({ onBack, onLogout }) {
    return (
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
            <Button text="Log out" onClick={onLogout} className="logout-button-override" />
        </header>
    );
}
export function Footer() {
    return (
        <footer className="main-card-footer">
            <div className="footer-line"></div>
            <p>Copyright DTC-08</p>
            <p>2026</p>
        </footer>
    );
}