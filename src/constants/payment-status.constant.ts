export const paymentStatusConstant = {
  PENDING: 100,
  SETTLEMENT: 200,
  EXPIRE: 300,
};

export const paymentStatusLabel = {
  [paymentStatusConstant.PENDING]: 'Pending',
  [paymentStatusConstant.SETTLEMENT]: 'Settlement',
  [paymentStatusConstant.EXPIRE]: 'Expire',
};

export function getPaymentStatus(status: string): number {
  switch (status.toLowerCase()) {
    case 'pending':
      return paymentStatusConstant.PENDING;
    case 'settlement':
      return paymentStatusConstant.SETTLEMENT;
    case 'expire':
      return paymentStatusConstant.EXPIRE;
    default:
      throw new Error('Invalid payment status');
  }
}