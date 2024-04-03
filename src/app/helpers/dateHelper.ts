import * as moment from 'moment-timezone';

 /**
   * get price date difference based on duration in years or months or days
   * @param start_date 
   * @param start_date 
   * @returns {string}
   */
  export function getPriceDateDifference(start_date:string,end_date:string):string{
    const years = moment(end_date).tz("Europe/Berlin").diff(start_date,'years',true);
    const months = moment(end_date).tz("Europe/Berlin").diff(start_date,'months',true);
    const days = moment(end_date).tz("Europe/Berlin").diff(start_date,'days',true);

    if(years)
        return years.toFixed(1)+'y';
    if(months)
        return months.toFixed(1)+'m';
    
    return days+'d';
  }
  /**
   * 
   * Add working days to moment date
   * 
   * @param date the date
   * @param days number of working days to add
   */

  export function addWorkingDays(date: moment.Moment, days: number) {
    let newDate = date.clone();
    for (let i = 0; i < days; i++) {
      if (newDate.isoWeekday() !== 6 && newDate.isoWeekday() !== 7) {
        newDate = newDate.add(1, "days");
      } else {
        newDate = newDate.add(1, "days");
        i--;
      }
    }
    return newDate.tz("Europe/Berlin");
  };

  
  /**
   * 
   * convert ISO date format to DD/MM/YY with europe timezone.
   * 
   * @param date the date
   * @return formatted date DD/MM/YYYY
   */

  export function formatDate(date: string) {
    return moment(date).tz("Europe/Berlin").format('DD/MM/YYYY')
  };