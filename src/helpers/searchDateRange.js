// Uses start and end date to add a condition for the query
module.exports = searchDateRange = (query, startDate, endDate) => {
  const setMidnight = (dateString) => {
    const [month, day, year] = dateString.split('-').map(Number) // Split the string and convert to numbers
    const dateObject = new Date(year, month - 1, day)

    dateObject.setUTCHours(0, 0, 0, 0) // Set hours, minutes, seconds, and milliseconds to zero
    return dateObject
  }

  if (startDate) var midnightStartDate = setMidnight(startDate)

  // Sets the end date to midnight of the next day so that it includes the entire day
  if (endDate) var endDay = setMidnight(endDate)
  if (endDay) var midnightEndDate = endDay.setDate(new Date(endDay).getDate() + 1)
    console.log(endDate)
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