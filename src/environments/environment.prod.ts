export const environment = {
    production: true,
    hmr: false, 
    api: 'https://{url}.com/api',
    referentialApi:'',
    geoApi:'',
    gemforceApi:'',
     oktaConfig: {
        issuer: '' ,
        redirectUri:  '',
        clientId: '',
        testing: {
            disableHttpsCheck: false
        },
        oktaAuthOptions: {
            pkce: true
        },  
        scopes: ['openid', 'profile', 'email', 'api.gepo']

    }
};
