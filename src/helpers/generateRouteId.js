// This is used to generate folder or file id's for routes
function generateRouteId(length = 20) {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;
  let routeId = '';
  for (let i = 0; i < length; i++) {
      if (i !== 0 && i % 5 === 0) {
          routeId += '-';
      }
      routeId += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return routeId;
}

module.exports = generateRouteId