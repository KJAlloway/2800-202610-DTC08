import './PageLabel.css'

function PageLabel({ text }) {
    // Reusable small title shown above a page card.
    return <p className="page-label">{text}</p>
}

export default PageLabel
