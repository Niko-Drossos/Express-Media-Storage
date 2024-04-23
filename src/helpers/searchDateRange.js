// Uses start and end date to add a condition for the query
module.exports = searchDateRange = (query, startDate, endDate) => {
  const setMidnight = (date) => {
    date.setUTCHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to zero
    return date;
  };

  const midnightStartDate = setMidnight(new Date(startDate));
  // Sets the end date to midnight of the next day so that it includes the entire day
  const midnightEndDate = setMidnight(new Date(endDate)).setDate(new Date(endDate).getDate() + 1);

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