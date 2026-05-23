# Cabbage Patch
### COMP-2800-DTC08
Live Website: https://cabbagepatch.netlify.app

## Description
A web application designed to reduce the difficulty of finding unique or specific cultural ingredients in Vancouver.
User sourced data will be used to share information on where and when ingredients were found. In the event that someone
was unable to find an ingredient, they will be able to make a request that is viewable by store owners.

This web app was built for the COMP 2800 course as part of BCIT's CST program.

## Technologies Used

| Front-end | Back-end       | Dev Tools          |
|-----------|----------------|--------------------|
| React     | Mongoose       | WebStorm/IntelliJ Idea |
| Leaflet   | MongoDB        | VSCode             |
| Express   | Nominatim      |                    |
|           | Open StreetMap |                    |
|           | bcrypt         |                    |

## How to run the project
- Clone the repository into Webstorm or VSCode
- Ensure JS, React, HTML, and CSS are installed or able to be run in your IDE
- Run `npm install` in both the `frontend` folder and `backend` folder
- A MongoDB Atlas API key is required to be added to a .env file in the `backend` directory assigned to the variable `MONGODB_URI`

#### Running the frontend
Navigate to the 'frontend' folder and run: `npm run dev` and open the link provided in the console.

#### Running the backend
Navigate to the 'backend' folder and run: `nodemon server.js` (auto refreshing server), or `node server.js` (not auto refreshing server)


## How to use
The map can be panned and zoomed to an area that the user desires to search. 
Pressing "Search This Area" will re-search for vendors in the viewport.
Ingredients, cuisine or store names can be entered into the search bar to filter the results.
A store card or map pin can be selected to highlight the vendor and view more information on them.

Additional features have been planned, but have not yet been implemented.

## About Us
Team Name: DTC-08
Team Members:
- Kelsen
- Finn
- David
- Andrew
- Donovan

Contact: fwylie@my.bcit.ca

## Credits
- [Leaflet](https://leafletjs.com/reference.html)
- [Nominatim](https://nominatim.org/release-docs/latest/api/Overview/)
- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright)
- [Cabbage icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/cabbage)


## File Structure
```
.
├── README.md
├── about.html
├── backend
│   ├── config
│   │   └── database.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── ingredientController.js
│   │   ├── receiptController.js
│   │   ├── requestController.js
│   │   └── searchController.js
│   ├── middleware
│   │   └── authenticate.js
│   ├── models
│   │   ├── Ingredient.js
│   │   ├── IngredientRequest.js
│   │   ├── Reciept.js
│   │   ├── RefreshToken.js
│   │   ├── User.js
│   │   └── Vendor.js
│   ├── node_modules
├── package.json
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── ingredientRoutes.js
│   │   ├── receiptRoutes.js
│   │   ├── requestRoutes.js
│   │   └── searchRoutes.js
│   ├── scripts
│   │   ├── clear.js
│   │   └── seed.js
│   ├── server.js
│   ├── test-connection.js
│   └── utils
│       ├── enrichIngredient.js
│       ├── password.js
│       └── tokens.js
├── frontend
│   ├── assets
│   │   ├── cabbage.png
│   │   ├── favicon_io
│   │   │   ├── android-chrome-192x192.png
│   │   │   ├── android-chrome-512x512.png
│   │   │   ├── apple-touch-icon.png
│   │   │   ├── favicon-16x16.png
│   │   │   ├── favicon-32x32.png
│   │   │   ├── favicon.ico
│   │   │   └── site.webmanifest
│   │   ├── map-pin.svg
│   │   ├── popOutIcon.png
│   │   ├── recenter-icon.svg
│   │   └── sounds
│   │       ├── freesound_community-8-bit-heaven-26287.mp3
│   │       └── universfield-video-game-bonus-323603.mp3
│   ├── index.html
│   ├── node_modules
├── package.json
│   ├── src
│   │   ├── APIs
│   │   │   ├── BrowserLocation.js
│   │   │   ├── Database.jsx
│   │   │   ├── Nominatim.jsx
│   │   │   └── Overpass.jsx
│   │   ├── components
│   │   │   ├── App
│   │   │   │   ├── App.css
│   │   │   │   └── App.jsx
│   │   │   ├── Auth
│   │   │   │   ├── Auth.css
│   │   │   │   └── AuthOverlay.jsx
│   │   │   ├── EasterEggCredits
│   │   │   │   ├── EasterEggCredits.css
│   │   │   │   └── EasterEggCredits.jsx
│   │   │   ├── IngredientSearch
│   │   │   │   ├── IngredientSearch.css
│   │   │   │   └── IngredientSearch.jsx
│   │   │   ├── LogSighting
│   │   │   │   ├── LogSightingModal.css
│   │   │   │   └── LogSightingModal.jsx
│   │   │   ├── Map
│   │   │   │   ├── Map.css
│   │   │   │   └── Map.jsx
│   │   │   ├── RequestIngredient
│   │   │   │   ├── RequestIngredientModal.css
│   │   │   │   └── RequestIngredientModal.jsx
│   │   │   ├── ResultsDrawer
│   │   │   │   ├── ResultsDrawer.css
│   │   │   │   └── ResultsDrawer.jsx
│   │   │   ├── SearchBar
│   │   │   │   ├── SearchBar.css
│   │   │   │   └── SearchBar.jsx
│   │   │   └── Sidebar
│   │   │       ├── Sidebar.css
│   │   │       └── Sidebar.jsx
│   │   ├── context
│   │   │   ├── AppContext.jsx
│   │   │   ├── AuthContext.jsx
│   │   │   └── LocationContext.jsx
│   │   ├── hooks
│   │   │   └── useMediaQuery.js
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── utils
│   │   │   ├── HelperFunctions.js
│   │   │   └── cookiesUtils.js
│   │   └── vite-env.d.ts
│   └── vite.config.js
└── render.yaml
```