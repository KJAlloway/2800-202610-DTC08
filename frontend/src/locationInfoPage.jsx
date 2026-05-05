import './locationInfoPage.css'

function NavBar() {
    return (
        <div className="nav">
            <div className="leftNav">
                <img src="../public/favicon.svg"></img>
                <h2>Cabbage Patch</h2>
            </div>
            <button>Log Out</button>
        </div>
    )
}

function MiddleSection() {
    return (
        <div className='middleSection'>
        
            <LeftColumn />
            <RightColumn />
            
        </div>
    )
}

function navigateToGoogleMaps() {
    return 0;
}

function LeftColumn() {
    return (
        <div className="leftColumn">
            <img src="../public/favicon.svg" alt="" />
            <button onClick={navigateToGoogleMaps}>Open Google Maps</button>
            <h2>Times found by a verified user</h2>
            <h2>Times found by an anonymous user</h2>
            <button>I didn't find this item here</button>
            <button>I found this item here</button>
        </div>
    )
}

function DatesList() {
    return (
        <div className='datesList'>
            <h2>Date 1</h2>
            <h2>Date 2</h2>
            <h2>Date 3</h2>
            <h2>Date 4</h2>
        </div>
    )
}

function RightColumn() {
    return (
        <div className='rightColumn'>
            <h2>Last Reported dates (verified users)</h2>
            <DatesList />
        </div>
    )
}

function Footer() {
    return (
        <div className='footer'>
            <h2>Copyright DTC-08</h2>
            <p>2026</p>
        </div>
    )
}

function StorePage() {
    return (
        <div>
            <NavBar />
            <MiddleSection />
            <Footer />
        </div>
        
    )
}

export default StorePage