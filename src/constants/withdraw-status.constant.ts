export const withdrawStatusConstant = {
  PENDING: 100,
  APPROVED: 200,
  REJECTED: 300,
};

export const withdrawStatusStringConstant = {
  PENDING: 'Sedang Diproses',
  APPROVED: 'Sudah Ditransfer',
  REJECTED: 'Gagal Ditransfer',
};

export function getWithdrawStatus(status: string): number {
  switch (status.toLowerCase()) {
    case 'pending':
      return withdrawStatusConstant.PENDING;
    case 'approved':
      return withdrawStatusConstant.APPROVED;
    case 'rejected':
      return withdrawStatusConstant.REJECTED;
    default:
      throw new Error('Invalid withdraw status');
  }
}