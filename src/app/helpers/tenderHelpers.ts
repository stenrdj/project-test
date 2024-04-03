import * as moment from "moment-timezone";
/**
* Return an array of pricing column titles 
* without 'Approved' because its not meant for pricing 
* it was add for Traders to approve the pricing;
* @param pricings - tender pricing object.
*/
export function getAttributesForPricingTable(pricings:any):any {
    const excludedAttributes = ['id','APPROVED','date'];
     if(typeof pricings == 'string')
     pricings = JSON.parse(pricings);
     else 
     pricings = JSON.parse(JSON.stringify(pricings));
     
     if(!!pricings && typeof pricings[0] == 'number') return [];

    const firstPriceData = getFirstPricingResultData(pricings);

    if(Object.values(pricings).length && !!firstPriceData?.results)
        return Object.values(firstPriceData['results'][0] )
        .map((item,key)=> Object.keys(item)[0] )
        .filter((item)=> !excludedAttributes.includes(item));
    
    return [];
}
export function getFirstPricingResultData(pricings:any){
    const first_price_result = pricings?.filter((elm)=>elm?.results?.length)[0];
 
    return first_price_result || []
}
/**
* Return Array of assets attribute
* @param assets - tender assets object.
* @returns Number - attributes of the assets with the greatests number of attributes
*/
export function getAttributesForAssetsTable(assets:any):any {
    if(!assets || !!assets && typeof assets[0] == 'number') return [];
    return Object.values(assets).filter((asset:any)=>asset?.description)
    .sort((a:any,b:any)=>Object.values(b.description).length - Object.values(a.description).length )[0];
}
/**
* Return pricing result ID from price Object
* @param Result - pricing result.
* @returns Number -  pricing result ID
*/
export function getPriceIdFromPricingResults(result:any):Number {
    if(!result || typeof result[0] != 'object') return 0;
     return Number(Object.values(Object.values(result).filter((item)=> Object.keys(item).includes('id'))[0]))
}

/**
* Return if price result approved
* @param Result - pricing result.
* @returns Boolean 
*/
export function isPriceResultApproved(result:any):Boolean {
   
    if(typeof result != 'object' || !result?.length || !result) return false;
    
     if(typeof result[0] != 'object') return false;
     
     if(Object.values(result).filter((item)=> Object.keys(item)?.includes('APPROVED')).length){
         return !!Object.values(Object.values(result).filter((item)=> Object.keys(item)?.includes('APPROVED'))[0])[0];
    }
    
    return false;
}
/**
* Return  price including selected price results
* @param RawPrices - pricing Object not filtred.
* @param idsList - results ids.
* @param priceID - price Id.
* @returns price 
*/
export function filterPricingResultsByIds(RawPrices:any,idsList:Array<Number>) {
        if(!RawPrices) return [];
     let _prices = JSON.parse(JSON.stringify(RawPrices));
    _prices =  Object.values(_prices).map((_price:any)=>{
         _price.results = _price.results.filter((result)=>{
              if(idsList.includes(getPriceIdFromPricingResults(result)))
                return true;
            else
                return false;
            
        });
             return _price;
       
    }) ;
    return _prices;
     
}
/**
* Return All results IDs & prices id
* @param price - Price object from tender pricing.
* @returns Array of ids 
*/
export function getAllResultsIdsFromPrice(price:any):Array<any> {
    let idsList = [];
    let _price = JSON.parse(JSON.stringify(price));
    
    idsList.push(_price.id);
    
    _price.results.map((result)=>{
        
        idsList.push(getPriceIdFromPricingResults(result));
        
    });
    return idsList;
}
/**
* Return All results IDs & prices id
* @param price - Price object from tender pricing.
* @param includePriceId - Optional , default true
* @returns Array of ids 
*/
export function getAllResultsPricingIdsFromPricings(prices:any,includePriceId:boolean=true):Array<any> {
    let idsList = [];
    let _prices = JSON.parse(JSON.stringify(prices));
    
    Object.values(_prices).map((_price:any)=>{

        if(includePriceId)
            idsList.push(_price.id);

        _price.results.map((result)=>{
            idsList.push(getPriceIdFromPricingResults(result));
        });
    })
    
    return idsList;
}
/**
 * Transform results to key as attribute and value before sending it to server;
 * @param  {any} result price result
 * @param  {string[]} excludeAttrs? attributes to exclude from the results
 */
export function transformUpdatedResultToKeyValue(result:any,excludeAttrs?:string[]){
    let finalResult = [];
    result.map((item)=>{
            const attr = Object.keys(item)[0];
            const val = attr == 'date' || attr == 'APPROVED' ? Object.values(item)[0] : Number(Object.values(item)[0]);
            if(excludeAttrs.length && !excludeAttrs.includes(attr) )
             finalResult = {...finalResult, [attr]: val } ;
             else if(!excludeAttrs) 
                finalResult = {...finalResult, [attr]: val } ;
          
      
     });
       return finalResult;
}

export function getTaskByPriceID(tasksList:any,priceID:number){
        const task = tasksList.filter((task)=>task.results?.includes(priceID))[0];
    return { comment:task?.code?.kwargs?.estimator_order.join(', '), ...task?.code?.kwargs}
}

/**
 * 
 * 
 */

export function formatComment(comment:any){
     const commentPattern = String(comment.text).match(new RegExp(/^__..*?(__)/g)) && String(comment.text).match(new RegExp(/^__..*?(__)/g))[0];
    let [FROM,TO,COUNT] = "";
     switch (commentPattern) {
         /* Example : "__TENDER_STATUS_CHANGED_FROM__/ anything/_TO_/anything" */
        case "__TENDER_STATUS_CHANGED_FROM__":
                 [FROM,TO] = comment.text.match(new RegExp(/(_\/..*?(\/_|$))/gm)).map((elm)=>elm.replace("/_","").replace("_/",""));
                return "Changed tender's status from "+FROM+" to "+TO+".";
            break;
        case "__TENDER_TECHNOLOGY_CHANGED_FROM__":
                [FROM,TO] = comment.text.match(new RegExp(/(_\/..*?(\/_|$))/gm)).map((elm)=>elm.replace("/_","").replace("_/",""));
                return "Changed tender's technology from "+FROM+" to "+TO+".";
            break;
        case "__TENDER_DEADLINE_CHANGED_FROM__":
                [FROM,TO] = comment.text.match(new RegExp(/(_\/..*?(\/_|$))/gm)).map((elm)=>elm.replace("/_","").replace("_/",""));
                return "Changed tender's deadline from "+moment(FROM).tz("Europe/Berlin").format('DD/MM/YYYY')+" to "+moment(TO).tz("Europe/Berlin").format('DD/MM/YYYY')+".";
            break;
        case "__TENDER_NAME_CHANGED_FROM__":
                [FROM,TO] = comment.text.match(new RegExp(/(_\/..*?(\/_|$))/gm)).map((elm)=>elm.replace("/_","").replace("_/",""));
                return "Changed tender's name from "+FROM+" to "+TO+".";
            break;
        case "__TENDER_COUNTRY_CHANGED_FROM__":
                 [FROM,TO] = comment.text.match(new RegExp(/(_\/..*?(\/_|$))/gm)).map((elm)=>elm.replace("/_","").replace("_/",""));
                 return "Changed tender's country from "+FROM+" to "+TO+".";
            break;
        case "__TENDER_DESCRIPTION_CHANGED_FROM__":
                 [FROM,TO] = comment.text.match(new RegExp(/(_\/..*?(\/_|$))/gm)).map((elm)=>elm.replace("/_","").replace("_/",""));
                 return "Changed tender's description from "+FROM+" to "+TO+".";
            break;
            /* Pricing Task & Object */
        case "__PRICING_TASK_CREATED__":
                return "Created new Pricing Task."
            break;
        case "__PRICING_OBJECT_CREATED__":
                return "Created new Pricing request."
            break;
        case "__PRICING_RESULTS_APPROVED_COUNT__":
                [COUNT] = comment.text.match(new RegExp(/(_\/..*?(\/_|$))/gm)).map((elm)=>elm.replace("/_","").replace("_/",""));
                return "Approved "+COUNT+" pricing results"
            break;
        case "__PRICING_RESULTS_CHANGED__":
                return "Changed valus of some/all pricing results"
            break;
            /* Timeseries */
        case "__TIMESERIE_FILE_UPLOADED__":
                return "Uploaded new Timeserie file."
            break;
            /* Assets upload */
        case "__ASSETS_FILE_UPLOADED__":
                return "Uploaded new Assets file."
            break;
            /* Offers */
        case "__OFFER_DELETED__":
                return "Deleted tender's Offer."
            break;
        case "__OFFER_CREATED__":
                "Created new tender's Offer."
        case "__TENDER_CREATED__":
                "Created the tender."
            break;
    
    
        default: 
            return comment.text;
            break;
    }
}
/**
 * Verify if the comment is an event or text comment
 * events have a pattern that starts with "___/"
 * @param  {string} comment
 * @returns { boolean } 
 */
export function isEventComment(comment:string):boolean{
    return comment.match(new RegExp(/^__..*?(__)/g)) && comment.match(new RegExp(/^__..*?(__)/g))[0].length > 0
}

/**
 * Convert base64 string to binary array buffer
 * @param  {string} base64
 */
export function base64ToArrayBuffer(base64:string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
/**
 * Flatten a nested json object to one level array.
 * @param  {object} obj the nested json object to flatten
 * @param  {} path='' the path of the propryties
 */
export function flatten(obj, path = '') {        
    if (!(obj instanceof Object)) return {[path.replace(/\.$/g, '')]:obj};

    return Object.keys(obj).reduce((output, key) => {
        return obj instanceof Array ? 
             {...output, ...flatten(obj[key],   '[' + key + '].')}:
             {...output, ...flatten(obj[key],  key.toLowerCase() + '.')};
    }, {});
}