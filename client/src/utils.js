export function toKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
