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