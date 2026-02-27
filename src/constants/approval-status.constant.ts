export const approvalStatusConstant = {
  PENDING: 100,
  APPROVED: 200,
  REJECTED: 300,
};

export const approvalStatusLabel = {
  [approvalStatusConstant.PENDING]: 'Pending',
  [approvalStatusConstant.APPROVED]: 'Approved',
  [approvalStatusConstant.REJECTED]: 'Rejected',
};

export const convertStatusToLabel = (status: number): string => {
  return approvalStatusLabel[status] || 'Unknown Status';
};
