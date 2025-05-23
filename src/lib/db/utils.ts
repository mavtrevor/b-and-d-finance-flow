
// Format date to YYYY-MM for monthYear filter
export const formatMonthYear = (date: Date): string => {
  return date.toISOString().substring(0, 7);
};
