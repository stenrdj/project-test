export const fixedPricesFormulas = [{
    name:'Gross Margin',
    attr:'GM',
},{
    name:'Guarantee of Origin',
    attr:'GOO',
},{
    name:'Curtailment Provisioning',
    attr:'CProv',
},{
    name:'Market Price',
    attr:'MP',
}];
export const commercialMarginFormulas = [{
    name:'Commercial Margin',
    attr:'CM',
} ];

export function isAttributeFromTheFormulat(attr:string){
    return !!fixedPricesFormulas.filter(elem=> elem.attr == attr).length
}

export function getSumProvCalculated(result:any):number{
    // sum prov = P50_PROV + Y2M_PROV
    // val1 = P50_PROV
    // val2 = Y2M_PROV
    const val1 = result.filter((elem)=> !!elem['P50_PROV'] ).length ? Object.values(result.filter((elem)=> !!elem['P50_PROV'] )[0])[0] : 0;
    const val2 = result.filter((elem)=> !!elem['Y2M_PROV'] ).length ? Object.values(result.filter((elem)=> !!elem['Y2M_PROV'] )[0])[0] : 0;
    
 
    return Number(val1) + Number(val2) ;

}

export function getNetMarginCalculated(result:any):number{
    // net margin = sum prov + gross margin

    // val1 = sum prov
    // val2 =  gross margin
    const val1 = getSumProvCalculated(result);
    const val2 = result.filter((elem)=> !!elem['GM']).length ? Object.values(result.filter((elem)=> !!elem['GM'] )[0])[0] : 0;
    
 
    return Number(val1) + Number(val2) ;

}

export function getNewBetaCalculated(result:any):string{
    // new beta = ( BETA - net margin + curtailment provisioning ) rounded to 2 decimals

    // val1 = BETA
    // val2 =  net margin
    // val3 =  curtailment provisioning

    const val1 = result.filter((elem)=> !!elem['BETA'] ).length ? Object.values(result.filter((elem)=> !!elem['BETA'] )[0])[0] : 0;
    const val2 = getNetMarginCalculated(result);
    const val3 = result.filter((elem)=> !!elem['CProv'] ).length ? Object.values(result.filter((elem)=> !!elem['CProv'] )[0])[0] : 0;
    
 
    return Number(Number(val1) - (Number(val1) + Number(val2))).toFixed(2);

}

export function getFixedPriceCalculated(result:any):number{
    // Price = MP + new beta + GoO

    // val1 = MP
    // val2 =  new beta
    // val3 =  GoO

    const val1 = result.filter((elem)=> !!elem['MP'] ).length ? Object.values(result.filter((elem)=> !!elem['MP'] )[0])[0] : 0;
    const val2 = getNewBetaCalculated(result);
    const val3 = result.filter((elem)=> !!elem['GOO']).length ? Object.values(result.filter((elem)=> !!elem['GOO'] )[0])[0] : 0;
    
 
    return  Number(val1) + Number(val1) + Number(val2) ;

}
export function getCMPriceCalculated(result:any):number{
    const val1 = result.filter((elem)=> !!elem['CM'] ).length ? Object.values(result.filter((elem)=> !!elem['CM'] )[0])[0] : 0;
    const val2 = result.filter((elem)=> !!elem['BETA'] ).length ? Object.values(result.filter((elem)=> !!elem['BETA'] )[0])[0] : 0;
    console.log(val1,val2);
    return Number(val1)+ Number(val2);
}
export function getPriceCalculated(result:any,formulat:'fixedPrice'|'CM'):number{
    if(formulat == 'fixedPrice')
        return getFixedPriceCalculated(result);
    if(formulat == 'CM')
            return getCMPriceCalculated(result);
}