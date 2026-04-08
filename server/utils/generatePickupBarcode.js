import crypto from 'crypto';

export function generatePickupBarcode(orderId) {
  const orderPrefix = orderId.toString().slice(-6);
  const randomPart  = crypto.randomBytes(4).toString('hex');
  const timePart    = Date.now().toString(36);

  return `PKP-${orderPrefix}-${randomPart}-${timePart}`.toUpperCase();
}

export default generatePickupBarcode;