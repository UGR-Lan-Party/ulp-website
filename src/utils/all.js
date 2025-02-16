/** */
export const getFormattedDate = (date) =>
  date
    ? new Date(date).toLocaleDateString('en-us', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

export const darkStyles = "dark:bg-gradient-to-r dark:from-[#0D1B3E] dark:to-[#004E7C]";