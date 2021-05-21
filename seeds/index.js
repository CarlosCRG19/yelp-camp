require("dotenv").config()
const mongoose = require("mongoose")
const Campground = require("../models/campground")
const cities = require("./cities")
const {places, descriptors} = require("./seedHelpers")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

mongoose.connect("mongodb://localhost:27017/yelp-camp", {useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true})

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error"))
db.once("open", () =>{
	console.log("Database connected")
})

const seedDB = async () => {
    await Campground.deleteMany({}) 
    for (let i = 0; i < 400; i++) {
        const randomCities = Math.floor(Math.random()*1000)
        const randomPlaces = Math.floor(Math.random()*21)
        const randomDescriptors = Math.floor(Math.random()*18) 
        const price = Math.floor(Math.random()*20) + 10
        const camp = new Campground({
            author: "60a2df92dc1ab50a35943bd2",
            title: `${descriptors[randomDescriptors]} ${places[randomPlaces]}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/dt8mkh1us/image/upload/v1621390135/YelpCamp/eey3illjae6wgskzxxhf.jpg',
                  filename: 'YelpCamp/eey3illjae6wgskzxxhf'
                },
                {
                  url: 'https://res.cloudinary.com/dt8mkh1us/image/upload/v1621390139/YelpCamp/ksgnsrzeqievtqpsisjm.png',
                  filename: 'YelpCamp/ksgnsrzeqievtqpsisjm'
                }
              ],
            price,
            location: `${cities[randomCities].city}, ${cities[randomCities].state}`,
            geometry: {
              type: 'Point',
              coordinates: [cities[randomCities].longitude, cities[randomCities].latitude]
            }
        })

        await camp.save()
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})