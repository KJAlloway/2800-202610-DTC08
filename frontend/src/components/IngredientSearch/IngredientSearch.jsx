import { useEffect, useRef, useState } from "react";
import { searchIngredients, createIngredient } from "../../APIs/Database.jsx";
import "./IngredientSearch.css";

/**
 * Ingredient autocomplete field.
 *
 * Props:
 *   value        — { id, name } | null — currently selected ingredient
 *   onChange     — called with { id, name } on selection, or null on clear
 *   placeholder  — input placeholder text
 *   inputId      — id attr on the <input> for label association
 *   allowCreate  — when true, shows "Add X as new ingredient" when no DB
 *                  results are found. Handles creation inline and calls
 *                  onChange with the newly created ingredient.
 */
export function IngredientSearch({ value, onChange, placeholder = "Search ingredients…", inputId, allowCreate = false }) {
    const [inputText,    setInputText]    = useState(value?.name ?? "");
    const [results,      setResults]      = useState([]);
    const [isOpen,       setIsOpen]       = useState(false);
    const [isSearching,  setIsSearching]  = useState(false);
    const [isCreating,   setIsCreating]   = useState(false);
    const [createError,  setCreateError]  = useState("");
    const [activeIndex,  setActiveIndex]  = useState(-1);
    const timerRef   = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (!value) setInputText("");
    }, [value]);

    useEffect(() => {
        function handleOutsideClick(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    function handleInputChange(e) {
        const text = e.target.value;
        setInputText(text);
        onChange(null);
        setActiveIndex(-1);
        setCreateError("");

        clearTimeout(timerRef.current);
        if (text.trim().length === 0) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsSearching(true);
        timerRef.current = setTimeout(async () => {
            try {
                const found = await searchIngredients(text.trim());
                setResults(found);
                setIsOpen(true);
            } catch {
                setResults([]);
                setIsOpen(allowCreate); // still open so "add new" is visible
            } finally {
                setIsSearching(false);
            }
        }, 280);
    }

    function selectIngredient(ingredient) {
        setInputText(ingredient.name);
        setResults([]);
        setIsOpen(false);
        setActiveIndex(-1);
        onChange({ id: ingredient._id, name: ingredient.name });
    }

    async function handleCreateNew() {
        const name = inputText.trim();
        if (!name) return;

        setIsCreating(true);
        setCreateError("");
        try {
            const ingredient = await createIngredient(name);
            selectIngredient(ingredient);
        } catch (err) {
            setCreateError(err.message ?? "Couldn't add that ingredient. Please try again.");
        } finally {
            setIsCreating(false);
        }
    }

    function handleKeyDown(e) {
        // Total items in the dropdown: results + optional "add new" row
        const totalItems = results.length + (allowCreate && inputText.trim() ? 1 : 0);
        if (!isOpen || totalItems === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, totalItems - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && activeIndex < results.length) {
                selectIngredient(results[activeIndex]);
            } else if (activeIndex === results.length) {
                handleCreateNew();
            }
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    }

    const showAddNew = allowCreate && inputText.trim().length > 0;
    const dropdownVisible = isOpen && (results.length > 0 || showAddNew);

    // Capitalise first letter for the "add new" label
    const addNewLabel = inputText.trim()
        ? inputText.trim().charAt(0).toUpperCase() + inputText.trim().slice(1)
        : "";

    return (
        <div className="ingredient-search" ref={wrapperRef}>
            <input
                id={inputId}
                className={`ingredient-search__input${value ? " ingredient-search__input--selected" : ""}`}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => dropdownVisible && setIsOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
                disabled={isCreating}
            />
            {(isSearching || isCreating) && (
                <span className="ingredient-search__spinner" aria-hidden="true" />
            )}

            {createError && (
                <p className="ingredient-search__create-error">{createError}</p>
            )}

            {dropdownVisible && (
                <ul className="ingredient-search__dropdown" role="listbox">
                    {results.map((ingredient, index) => (
                        <li
                            key={ingredient._id}
                            className={`ingredient-search__option${index === activeIndex ? " ingredient-search__option--active" : ""}`}
                            role="option"
                            aria-selected={index === activeIndex}
                            onMouseDown={() => selectIngredient(ingredient)}
                        >
                            <span className="ingredient-search__option-name">{ingredient.name}</span>
                            {ingredient.culturalTags?.length > 0 && (
                                <span className="ingredient-search__option-tags">
                                    {ingredient.culturalTags.slice(0, 2).join(", ").replaceAll("_", " ")}
                                </span>
                            )}
                        </li>
                    ))}

                    {showAddNew && (
                        <li
                            className={`ingredient-search__option ingredient-search__option--create${activeIndex === results.length ? " ingredient-search__option--active" : ""}`}
                            role="option"
                            aria-selected={activeIndex === results.length}
                            onMouseDown={handleCreateNew}
                        >
                            <span className="ingredient-search__option-name">
                                {isCreating ? "Adding…" : `+ Add "${addNewLabel}" as a new ingredient`}
                            </span>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}
