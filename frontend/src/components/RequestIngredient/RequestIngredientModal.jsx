import { useState } from "react";
import { useAppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { IngredientSearch } from "../IngredientSearch/IngredientSearch.jsx";
import { createIngredientRequest } from "../../APIs/Database.jsx";
import "./RequestIngredientModal.css";

export function RequestIngredientModal() {
    const { requestModalDefaults, setRequestModalIsOpen, areaName } = useAppContext();
    const { currentUser, setAuthOverlayIsOpen } = useAuth();

    const [ingredient,    setIngredient]    = useState(
        requestModalDefaults?.ingredientId
            ? { id: requestModalDefaults.ingredientId, name: requestModalDefaults.ingredientName ?? "" }
            : null
    );
    const [neighbourhood, setNeighbourhood] = useState(
        requestModalDefaults?.neighbourhood ?? areaName ?? ""
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error,     setError]     = useState("");
    const [success,   setSuccess]   = useState(false);

    function handleClose() {
        setRequestModalIsOpen(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!ingredient)           { setError("Please select an ingredient."); return; }
        if (!neighbourhood.trim()) { setError("Please enter a neighbourhood."); return; }

        setIsLoading(true);
        try {
            await createIngredientRequest(ingredient.id, neighbourhood.trim());
            setSuccess(true);
            setTimeout(handleClose, 1400);
        } catch (err) {
            if (err.status === 409) {
                setError("You've already requested this ingredient in that neighbourhood.");
            } else {
                setError(err.message ?? "Something went wrong. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-panel" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="request-modal-title">

                <header className="modal-header">
                    <h2 id="request-modal-title">Request an Ingredient</h2>
                    <button className="modal-close-button" type="button" aria-label="Close" onClick={handleClose}>×</button>
                </header>

                {!currentUser ? (
                    <div className="modal-auth-prompt">
                        <p>You need to be logged in to submit a request.</p>
                        <button
                            className="modal-submit-button"
                            type="button"
                            onClick={() => { handleClose(); setAuthOverlayIsOpen(true); }}
                        >
                            Log in
                        </button>
                    </div>
                ) : success ? (
                    <p className="modal-success">✓ Request submitted — the community will keep an eye out!</p>
                ) : (
                    <form className="modal-form" onSubmit={handleSubmit}>
                        {error && <p className="modal-error">{error}</p>}

                        <label htmlFor="request-ingredient">What are you looking for?</label>
                        <IngredientSearch
                            inputId="request-ingredient"
                            value={ingredient}
                            onChange={setIngredient}
                            placeholder="Search ingredients…"
                        />

                        <label htmlFor="request-neighbourhood">Neighbourhood</label>
                        <input
                            id="request-neighbourhood"
                            className="modal-input"
                            type="text"
                            value={neighbourhood}
                            onChange={e => setNeighbourhood(e.target.value)}
                            placeholder="e.g. Chinatown, Kitsilano…"
                        />
                        <p className="modal-hint">
                            Requests are public — store owners in the area can see what shoppers are looking for.
                        </p>

                        <button className="modal-submit-button" type="submit" disabled={isLoading}>
                            {isLoading ? "Submitting…" : "Submit Request"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
