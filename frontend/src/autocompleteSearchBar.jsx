import { useState } from "react";

function ItemSearch() {
    const [searchText, setSearchText] = useState("");

    const rawData = [
        "test1",
        "TEST2",
        "Te St 3",
        "   TesT    4",
        "test t5 ",
        "peas", "beans", "soup", "rock", "piranhas"
    ]

    // callback function that can be passed to a map to perform an operation on all members of it
    const normalizeString = (string) => {
        return string.toLowerCase().replaceAll(" ", "");
    }

    const data = rawData.map(normalizeString);

    // callback function to filter text that includes the input string
    const filteredResults = data.filter((item) => searchText.length !== 0 && item.includes(normalizeString(searchText)))

    return (
        <div>
            <h2>Item Search</h2>

            <form>
                <input type="text" 
                value={searchText} 
                onChange={(e) => setSearchText(e.target.value)} 
                />
            </form>

            <ul>
                {filteredResults.map((item, index) => {
                    return (
                    <div>
                        <button key={index}>{item}</button>
                    </div>
                    )
                })}
            </ul>
        </div>
    )
}

export default ItemSearch