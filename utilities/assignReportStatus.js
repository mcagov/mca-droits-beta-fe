export const assignReportStatus = function (id) {
  let status;
  let statusAttr;
  let statusColour;

  switch (id) {
    case 614880000:
      status = "received";
      statusAttr = "received";
      statusColour = "purple";
      break;
    case 614880001:
      status = "investigation ongoing";
      statusAttr = "ongoing"
      statusColour = "blue"
      break;
    case 614880002:
      status = "closed";
      statusAttr = "closed"
      statusColour = "grey";
      break;
    case 614880004:
      status = "awaiting your response";
      statusAttr = "awaiting"
      statusColour = "orange"
      break;
  }

  return [status, statusAttr, statusColour];
};