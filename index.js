import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const port = 3000;

app.use(express.static("public"))
const apiKey = process.env.uvAPI;

app.get('/',(req,res)=>{
    res.render("index.ejs")
})
app.get('/name',async(req,res)=>{
   const city = req.query.name;
const country = req.query.country;
try {
    const response = await axios.get(
  `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ', ' + country)}&format=geocodejson`
);
    const latitude = response.data.features[0].geometry.coordinates[1]
const longitude = response.data.features[0].geometry.coordinates[0]

const uvURL = await axios.get(`https://api.openuv.io/api/v1/uv?lat=${latitude}&lng=${longitude}`,{headers:{
    "x-access-token": apiKey
}})
const uvNow = uvURL.data.result.uv;
const uvMax = uvURL.data.result.uv_max;
const uvMaxTime = uvURL.data.result.uv_max_time;

// Decide message based on current UV
let currentAdvice = "";

if (uvNow < 3) {
  currentAdvice = `Low UV. You're safe to be outside in ${city}`;
} else if (uvNow < 6) {
  currentAdvice = `Moderate UV. Wear sunscreen and sunglasses in ${city}`;
} else if (uvNow < 8) {
  currentAdvice = `High UV. Stay in the shade and reapply sunscreen in ${city}`;
} else {
  currentAdvice = `Very high UV! Avoid sun exposure if possible in ${city}`;
}
const message = `Max UV today will be ${uvMax.toFixed(1)} at ${new Date(uvMaxTime).toLocaleTimeString()}`;


console.log(currentAdvice)
    
    res.render("index.ejs",{currentAdvice,message})
    
} catch (error) {
    console.error("Error occurred while fetching UV data:", error.message);

    res.render("index.ejs", {
        currentAdvice: "Sorry, we couldn't fetch the UV index right now.",
        message: "Please try again later or check your city and country input."
    });
}


})

app.listen(port,()=>{
    console.log(`Server running on port ${port}`)
})