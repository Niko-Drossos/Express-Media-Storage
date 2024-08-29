// Uses start and end date to add a condition for the query object for Mongoose
module.exports = searchDateRange = (query, startDate, endDate) => {
  const setMidnight = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number) // Split the string and convert to numbers
    const dateObject = new Date(year, month - 1, day)

    dateObject.setUTCHours(23, 59, 59, 999) // Set hours, minutes, seconds, and milliseconds to zero
    return dateObject
  }

  if (startDate) var midnightStartDate = setMidnight(startDate)

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