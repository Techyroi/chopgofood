function calculateDeliveryFee(
  baseFee,
  distanceKm,
  totalQuantity
) {
  let distanceCharge = 0;

  if (distanceKm <= 3) {
    distanceCharge = 0;
  } else if (distanceKm <= 5) {
    distanceCharge = 200;
  } else if (distanceKm <= 8) {
    distanceCharge = 400;
  } else if (distanceKm <= 12) {
    distanceCharge = 700;
  } else {
    distanceCharge = 1000;
  }

  let largeOrderCharge = 0;

  if (totalQuantity >= 6 && totalQuantity <= 10) {
    largeOrderCharge = 200;
  } else if (totalQuantity >= 11) {
    largeOrderCharge = 400;
  }

  return (
    baseFee +
    distanceCharge +
    largeOrderCharge
  );
}

module.exports = calculateDeliveryFee;