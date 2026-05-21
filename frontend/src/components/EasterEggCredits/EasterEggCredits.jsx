import "./EasterEggCredits.css"

const GROUP_MEMBERS = [
    "Kelsen",
    "Finn",
    "David",
    "Donovan",
    "Andrew"
]

const NAME_POSTIONS =[
    "15%",
    "30%",
    "45%",
    "60%",
    "75%"
]

function EasterEggCredits() {
    return (
        <div className="easter-egg-overlay">
            {GROUP_MEMBERS.map((member, index) => (
                <h1
                    key={member}
                    className="credits-name"
                    style={{
                        top: NAME_POSTIONS[index],
                        animationDelay: `${index * 1.5}s`
                    }}
                    
                >
                    {member}
                </h1>
            ))}

        </div>
    )
}

export default EasterEggCredits;