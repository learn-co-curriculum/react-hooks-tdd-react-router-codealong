export function integerToRoman(integer) {
  const romanNumberMap = {
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };
  let roman = "";
  for (const numeral in romanNumberMap) {
    while (integer >= romanNumberMap[numeral]) {
      roman += numeral;
      integer -= romanNumberMap[numeral];
    }
  }
  return roman;
}
