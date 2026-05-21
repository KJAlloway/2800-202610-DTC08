import './OpenInGoogleMapsButton.css'
import {useState} from "react";

export default function OpenInGoogleMapsButton(vendor) {
    const [isActive, setIsActive] = useState(false);

    function buildGoogleMapsUrl(vendor) {
        let placeInfo = encodeURIComponent(vendor.vendorName + '' + vendor.vendorAddress)
        return `https://www.google.com/maps/search/?api=1&query=${placeInfo}`
    }

    function handleBtnClick(vendor) {
        setIsActive(true)
        window.open(buildGoogleMapsUrl(vendor), '_blank', 'noopener,noreferrer')
    }

    return (
        <div>
            <button className={`results-drawer__open-in-google-maps-button${
                        isActive ? " results-drawer__open-in-google-maps-button--active" : ""
                    }`}
                    type="button"
                    onMouseDown={() => handleBtnClick(vendor)}
                    onMouseUp={() => setIsActive(false)} // resets the button's style when it is not pressed down
                    onMouseLeave={() => setIsActive(false)} // resets the button's style when it is not pressed down
                    >
                Google Maps
                <img src="../assets/popOutIcon.png" alt="popout_icon" className="results-drawer__popout-icon" />
            </button>
        </div>
    )
}

