import { useEffect, useRef } from "react";

export function toKebabCase(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function generateUniqueString(length = 13) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function isItemEnchantable(item) {
  return ["hands", "weapon", "armor", "head", "legs", "boots"].includes(item.type);
}