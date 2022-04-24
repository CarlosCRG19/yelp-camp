const express = require('express')
const router = express.Router({mergeParams: true})
const catchAsync = require("../utils/catchAsync")
const Campground = require("../models/campground")
const Review = require("../models/review.js")
const review = require("../controllers/review")
const {isLoggedIn, isReviewAuthor, validateReview} = require("../middleware")

router.post("/", isLoggedIn, validateReview, catchAsync(review.createReview))
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(review.deleteCampground))

module.exports = router