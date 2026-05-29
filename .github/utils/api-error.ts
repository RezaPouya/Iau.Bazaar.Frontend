export const getApiError = (err: any) => {
  return err?.response?.data?.message || err?.message || 'خطای ناشناخته';
};
