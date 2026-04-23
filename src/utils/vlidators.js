export function isValidPhone(phone) {
  return /^0[5-7][0-9]{8}$/.test(phone);
}

export function isValidQuantity(qty) {
  return Number(qty) > 0;
}   