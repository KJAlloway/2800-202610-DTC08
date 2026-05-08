import './sharedComponents.css'

export function NavBar() {
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

export function Footer() {
    return (
        <div className='footer'>
            <h2>Copyright DTC-08</h2>
            <p>2026</p>
        </div>
    )
}