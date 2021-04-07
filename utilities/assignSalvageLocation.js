export const assignSalvageLocation = function (id) {
  let recoveredFrom;

  switch (id) {
    case 614880000:
      recoveredFrom = "Shipwreck";
      break;
    case 614880001:
      recoveredFrom = "Seabed";
      break;
    case 614880002:
      recoveredFrom = "Afloat";
      break;
    case 614880003:
      recoveredFrom = "Sea shore";
      break;
  }

  return recoveredFrom;
};