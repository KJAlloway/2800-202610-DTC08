import { useState } from "react";
import { useAppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { IngredientSearch } from "../IngredientSearch/IngredientSearch.jsx";
import { logSighting } from "../../APIs/Database.jsx";
import "./LogSightingModal.css";

export function LogSightingModal() {
    const { receiptModalDefaults, setReceiptModalIsOpen, vendors } = useAppContext();
    const { currentUser, setAuthOverlayIsOpen } = useAuth();

    // Initialise from defaults on first mount — no useEffect needed.
    // The modal is only mounted when open, so these run exactly once per open.
    const [ingredient, setIngredient] = useState(
        receiptModalDefaults?.ingredientId
            ? { id: receiptModalDefaults.ingredientId, name: receiptModalDefaults.ingredientName ?? "" }
            : null
    );
    const [vendorOsmId, setVendorOsmId] = useState(receiptModalDefaults?.vendorOsmId ?? "");
    const [found,       setFound]       = useState(null);
    const [isLoading,   setIsLoading]   = useState(false);
    const [error,       setError]       = useState("");
    const [success,     setSuccess]     = useState(false);

    function handleClose() {
        setReceiptModalIsOpen(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!ingredient)    { setError("Please select an ingredient."); return; }
        if (!vendorOsmId)   { setError("Please select a vendor."); return; }
        if (found === null) { setError("Please mark whether you found it."); return; }

        setIsLoading(true);
        try {
            await logSighting(vendorOsmId, ingredient.id, found);
            setSuccess(true);
            setTimeout(handleClose, 1400);
        } catch (err) {
            setError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="receipt-modal-title">

                <header className="modal-header">
                    <h2 id="receipt-modal-title">Log a Sighting</h2>
                    <button className="modal-close-button" type="button" aria-label="Close" onClick={handleClose}>×</button>
                </header>

                {!currentUser ? (
                    <div className="modal-auth-prompt">
                        <p>You need to be logged in to log a sighting.</p>
                        <button
                            className="modal-submit-button"
                            type="button"
                            onClick={() => { handleClose(); setAuthOverlayIsOpen(true); }}
                        >
                            Log in
                        </button>
                    </div>
                ) : success ? (
                    <p className="modal-success">✓ Sighting logged — thanks for contributing!</p>
                ) : (
                    <form className="modal-form" onSubmit={handleSubmit}>
                        {error && <p className="modal-error">{error}</p>}

                        <label htmlFor="receipt-ingredient">What ingredient?</label>
                        <IngredientSearch
                            inputId="receipt-ingredient"
                            value={ingredient}
                            onChange={setIngredient}
                            placeholder="Search ingredients…"
                            allowCreate
                        />

                        <label htmlFor="receipt-vendor">Which vendor?</label>
                        <select
                            id="receipt-vendor"
                            className="modal-select"
                            value={vendorOsmId}
                            onChange={e => setVendorOsmId(e.target.value)}
                        >
                            <option value="">— Select a nearby vendor —</option>
                            {vendors.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                        {vendors.length === 0 && (
                            <p className="modal-hint">No vendors loaded yet — pan the map to load some first.</p>
                        )}

                        <fieldset className="modal-found-fieldset">
                            <legend>Did you find it?</legend>
                            <div className="modal-found-buttons">
                                <button
                                    type="button"
                                    className={`modal-found-btn modal-found-btn--yes${found === true ? " modal-found-btn--active" : ""}`}
                                    onClick={() => setFound(true)}
                                >
                                    ✓ Found it
                                </button>
                                <button
                                    type="button"
                                    className={`modal-found-btn modal-found-btn--no${found === false ? " modal-found-btn--active" : ""}`}
                                    onClick={() => setFound(false)}
                                >
                                    ✗ Not there
                                </button>
                            </div>
                        </fieldset>

                        <button className="modal-submit-button" type="submit" disabled={isLoading}>
                            {isLoading ? "Saving…" : "Submit Sighting"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
