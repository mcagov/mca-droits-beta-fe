export const assignOutcome = function (id) {
  let outcome;

  switch (id) {
    case 614880000:
      outcome = "You have been awarded this item in lieu of a salvage award";
      break;
    case 614880001:
      outcome = "This item has been returned to the owner";
      break;
    case 614880002:
      outcome = "This item has been donated to a museum";
      break;
    case 614880003:
      outcome = "This item has been sold to a museum";
      break;
    case 614880004:
      outcome = null;
      break;
  }

  return outcome;
};