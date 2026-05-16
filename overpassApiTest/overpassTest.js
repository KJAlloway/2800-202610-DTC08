let name = "Loblaws"

let query = `
    [out:json][timeout:10];
area[name="Vancouver"]->.searchArea;
node["name"="${name}"](area.searchArea);
out body;
    `;
let result = await fetch(
    "https://overpass.private.coffee/api/interpreter",
    {
        headers: {"User-Agent": "CabbagePatch/0.3 (fwylie@my.bcit.ca"},
        method: "POST",
        body: "data=" + encodeURIComponent(query),
    }
).then((data) => data.json());

console.log(JSON.stringify(result, null, 2));