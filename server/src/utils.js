function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUniqueString(length = 13) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function calculatePercentage(part, whole) {
  if (whole !== 0) {
    return (part / whole) * 100;
  } else {
    return 0;
  }
}

function parsePositionFromString(string) {
  const [x, y] = string?.trim()?.split(" ");
  return [parseInt(x), parseInt(y)];
}

function isItemEnchantable(item) {
  return ["hands", "weapon", "armor", "head", "legs", "boots"].includes(item.type);
}

module.exports = {
  isItemEnchantable,
  getRandomInt,
  generateUniqueString,
  calculatePercentage,
  parsePositionFromString,
};