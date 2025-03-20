// Uses start and end date to add a condition for the query object for Mongoose
// This is one of the worst functions I have ever created, use with caution.
module.exports = searchDateRange = (query, startDate, endDate) => {
  // Although this function is depreciated, I am keeping it here for proof of my stupidity.
  // The pain I went through to create such a pointless function baffles me, and I want to baffle others as well. 
  /*const setMidnight = (dateString) => {
    const [month, day, year] = dateString.split('-').map(Number) // Split the string and convert to numbers
    const dateObject = new Date(year, month - 1, day)

    return dateObject
  } */
 // if (startDate) var midnightStartDate = setMidnight(startDate)

  if (startDate) var midnightStartDate = new Date(startDate)

  // Sets the end date to midnight of the next day so that it includes the entire day
  if (endDate) {
    var endDay = new Date(endDate).getDate() + 1
    var midnightEndDate = new Date(new Date(endDate).setDate(endDay))
  }
  
  if (startDate && endDate) {
    query.date = {
      $gte: midnightStartDate,
      $lte: midnightEndDate
    }
  } else if (startDate) {
    query.date = {
      $gte: midnightStartDate
    }
  } else if (endDate) {
    query.date = {
      $lte: midnightEndDate
    }
  }

  return query
}