import { useState } from 'react';
import './locationInfoPage.css'
import FirstTimeHint from '../FirstTimeHint/FirstTimeHint';
import { useFirstTimeHint } from '../FirstTimeHint/useFirstTimeHint';
import Button from '../TemplateButtons/Button';
import BackButton from '../BackButtonTemplate/BackButton';
import cabbageLogo from '../assets/cabbage-logo.svg';
import { NavBar, Footer } from '../NavbarAndFooter/sharedComponents';
import ScrollableList from '../TemplateScrollableLists/ScrollableList';
import '../Interraction hints/hints.css'

function MiddleSection() {
    const [reportType, setReportType] = useState('verified');
    const verifiedDates = ["May 10, 2026", "May 08, 2026", "May 05, 2026", "April 30, 2026"];
    const anonymousDates = ["May 11, 2026", "May 09, 2026", "May 04, 2026"];

    const currentDates = reportType === 'verified' ? verifiedDates : anonymousDates;

    return (
        <div className='middleSection'>
            <LeftColumn setReportType={setReportType} currentType={reportType} />
            <RightColumn dates={currentDates} reportType={reportType} />
        </div>
    );
}

function navigateToGoogleMaps() {
    return 0;
}

function LeftColumn({ setReportType, currentType }) {
    return (
        <div className="leftColumn">
            <div className="info-box-outer">
                <div className="info-box-inner">
                    Address Placeholder
                </div>
            </div>

            <Button
                text="Link to Google Maps"
                onClick={navigateToGoogleMaps}
                className="full-width-action"
            />

            <div className="stats-box">
                <Button
                    text="Times found by a verified user"
                    className={`info-button ${currentType === 'verified' ? 'active' : ''}`}
                    onClick={() => setReportType('verified')}
                />
                <Button
                    text="Times found by an anonymous user"
                    className={`info-button ${currentType === 'anonymous' ? 'active' : ''}`}
                    onClick={() => setReportType('anonymous')}
                />
            </div>
        </div>
    );
}

function StatusWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    if (hasSubmitted) {
        return (
            <div className="info-box-outer status-widget-container">
                <div className="info-box-inner status-widget-submitted">
                    Thank you! Your report has been recorded.
                </div>
            </div>
        );
    }

    return (
        <div className="status-widget-container">
            {!isOpen ? (
                <Button 
                    text="Report Sighting Status" 
                    onClick={() => setIsOpen(true)} 
                    className="full-width-action"
                />
            ) : (
                <div className="info-box-outer">
                    <div className="info-box-inner status-widget-popup">
                        <p className="status-widget-title">Did you find this item here today?</p>
                        
                        <div className="report-actions-row">
                            <Button 
                                text="No, I didn't"
                                className="danger-btn"
                                onClick={() => setHasSubmitted(true)} 
                            />
                            <Button 
                                text="Yes, I found it!"
                                className="success-btn"
                                onClick={() => setHasSubmitted(true)} 
                            />
                        </div>
                        
                        <button className="status-widget-cancel" onClick={() => setIsOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function DatesList({ dates }) {
    return (
        <div className='datesList'>
            {dates.map((date, i) => (
                <div key={i} className="date-pill">{date}</div>
            ))}
        </div>
    );
}

function RightColumn({ dates, reportType }) {
    return (
        <div className='rightColumn'>
            <div className="info-box-outer header-box">
                <div className="info-box-inner">
                    Last reported dates ({reportType})
                </div>
            </div>

            <ScrollableList maxHeight="240px">
                {dates.map((date, i) => (
                    <div key={i} className="date-pill-outer">
                        <div className="date-pill-inner">
                            {date}
                        </div>
                    </div>
                ))}
            </ScrollableList>
        </div>
    );
}

function FoodInformationPage({ onBack, onLogout }) {
    const [showHints, onDisableHints] = useFirstTimeHint('cabbagepatch_info_hint_hidden');
    
    return (
        <div className="main-page-wrapper">
            <p className="page-context-title">Location Details</p>
            <div className="main-card wide-card">
                <NavBar onBack={onBack} onLogout={onLogout} />

                {showHints && (
                    <FirstTimeHint
                        title="Viewing Location Stats"
                        message="Check out the verified users and anonymous reporters (Guest) sightings by clicking on either of the buttons!"
                        onDismiss={onDisableHints}
                    />
                )}

                <MiddleSection />
                <StatusWidget />
                <Footer />
            </div>
        </div>
    );
}

export default FoodInformationPage