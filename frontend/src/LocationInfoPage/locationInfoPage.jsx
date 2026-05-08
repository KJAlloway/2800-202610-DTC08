import './locationInfoPage.css'
import { NavBar, Footer } from '../Navbar and Footer(andrew)/sharedComponents';
import '../Interraction hints/hints.css'


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

function Hints() {
    return (
        <div>
            <div className='interractionHint' style={{top: "175px", left: "0px"}}>
                Open the GoogleMaps directions to this location
            </div>
            <div className='interractionHint' style={{top: "575px", left: "0px"}}>
                Click to confirm the lack of this item at this location
            </div>
            <div className='interractionHint' style={{top: "700px", left: "0px"}}>
                Click to confirm the presence of this item at this location
            </div>
            <div className='interractionHint' style={{top: "300px", right: "0px"}}>
                The most recent dates when a verified (logged in) user confirmed the presence of this item at this location
            </div>
            
        </div>
    )
}



function StorePage() {
    return (

        <div>
            <NavBar />
            <MiddleSection />
            <Footer />
            <Hints />
        </div>
        
    )
}

export default StorePage