import { foods } from "../db/mockData.js";
export async function searchForFoodLocations(req, res) {
    let locations = [];
    console.log("Searching for food")
    console.log(foods)
    
    try {
        const cleanedQuery = req.query.foodName?.trim().toLowerCase() || '';

        if(!cleanedQuery) {
            console.log("No query")
            return res.send([])
        }

        const matchingFood = foods.find((food) => 
            food.name.toLowerCase().includes(cleanedQuery)
        )
        
        if (!matchingFood) {
            console.log("No matching food")
            return res.send([])
        }
        console.log(matchingFood)
        return res.send(matchingFood.locations)
    } catch (error) {
        console.log(error)
        return res.status(400).send([])
    }

}

export async function addFoodReport(req, res) {
    try {
        let foodIdQuery = req.query.foodId;
        let locationIdQuery = req.query.locationId;
        let userIdQuery = req.query.userId;
        let foundQuery = req.query.found;

        food = foods.find((aFood) => aFood.foodId === foodIdQuery);
        if (food) {
            let location = food.locations.find((aLocation) => aLocation.locationId === locationIdQuery);
            if (location) {
                location.reportedDates.push({
                    found: foundQuery,
                    date: new Date(),
                    userId: userIdQuery || null
                })

            } else {
                food.locations.push({
                    // Create a new location based on api info
                })
            }
        } else {
            // Add a new food and a location then the report
        }
        return res.send("Succeded in updating database");
    } catch (error) {
        return res.status(400).send("Failed to update database");
    }
}