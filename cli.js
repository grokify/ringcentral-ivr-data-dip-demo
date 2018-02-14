const vorpal = require('vorpal')();

require('dotenv').config({path: process.env.ENV_PATH})

var ringcentral = require('ringcentral');

console.log(process.env.RINGCENTRAL_SERVER_URL_2);

var rcsdk2 = new ringcentral({
    server:    process.env.RINGCENTRAL_SERVER_URL_2,
    appKey:    process.env.RINGCENTRAL_CLIENT_ID_2,
    appSecret: process.env.RINGCENTRAL_CLIENT_SECRET_2
});

var rcsdk2_platform = rcsdk2.platform();

rcsdk2_platform
    .login({
        username:  process.env.RINGCENTRAL_USERNAME_2,
        extension: process.env.RINGCENTRAL_EXTENSION_2,
        password:  process.env.RINGCENTRAL_PASSWORD_2
    })
    .then(function(authResponse) {
        console.log('RC authResponse: ', authResponse.json());
        //init();
    })
    .catch(function(e) {
        console.error(e);
        throw e;
    });

vorpal
    .command('foo', 'Outputs "bar".')
    .action(function(args, callback) {
        this.log('bar');
        callback();
    });

vorpal
    .command('create-forwarding-number [phoneNumber] [label]', 'Outputs args.')
    .action(function(args, callback) {
        CreateForwardingNumber(rcsdk2_platform, args['phoneNumber'], args['label'])
        this.log(JSON.stringify(args));
        callback();
    });

vorpal
    .command('create-forwarding-numbers', 'Outputs args.')
    .action(function(args, callback) {
        CreateForwardingNumber(rcsdk2_platform,
            process.env.IVRDEMO_DEFAULT_FINAL_EXTENSION_DIRECT_NUMBER,
            process.env.IVRDEMO_DEFAULT_FINAL_EXTENSION_LABEL);
        CreateForwardingNumber(rcsdk2_platform,
            process.env.IVRDEMO_SPECIAL_FINAL_EXTENSION_DIRECT_NUMBER,
            process.env.IVRDEMO_SPECIAL_FINAL_EXTENSION_LABEL);
        this.log(JSON.stringify(args));
        callback();
    });

function CreateForwardingNumber(sdk_platform, phoneNumber, label) {
    sdk_platform.post('/account/~/extension/~/forwarding-number', {
        "phoneNumber" : phoneNumber,
        "label" : label
    })
    .then(function(response) {
        console.log('Success: ' + response.json().id);
    })
    .catch(function(e) {
        console.log('Error: ' + e.message);
    });
}

vorpal
  .delimiter('myapp$')
  .show();