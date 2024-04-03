 import { BehaviorSubject, Observable, Subject } from 'rxjs';

/**
 * Return boolean if the current user is Trader and not Originator
 */
 
export function isCurrentUserTrader():boolean {
     const groups:[string] = JSON.parse(localStorage.getItem('okta-token-storage'))?.accessToken?.claims?.groups;
 
    if(groups?.includes('gepo-trader') || groups?.includes('gepo-admin'))
         return true;
     
    return false;
    
}
export function isCurrentUserOriginator() {
      const groups:[string] = JSON.parse(localStorage.getItem('okta-token-storage'))?.accessToken?.claims?.groups;
 
    if(groups?.includes('gepo-originator') || groups?.includes('gepo-admin'))
         return true;
     
    return false;
    
    
}
