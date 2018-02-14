require('dotenv').config({path: process.env.ENV_PATH})

var ringcentral = require('ringcentral');

// SDK 1 represents main account with incoming extension and final extensions.
// This can be your production account.
var rcsdk1 = new ringcentral({
    server:    process.env.RINGCENTRAL_SERVER_URL,
    appKey:    process.env.RINGCENTRAL_CLIENT_ID,
    appSecret: process.env.RINGCENTRAL_CLIENT_SECRET
});

var platform1    = rcsdk1.platform();
var subscription = rcsdk1.createSubscription();

platform1
    .login({
    	username:  process.env.RINGCENTRAL_USERNAME,
    	extension: process.env.RINGCENTRAL_EXTENSION,
    	password:  process.env.RINGCENTRAL_PASSWORD
    })
    .then(function(authResponse) {
        console.log('RC authResponse: ', authResponse.json());
        init();
    })
    .catch(function(e) {
        console.error(e);
        throw e;
    });

// SDK 2 represents your routing account used create custom forwarding rules.
// This can be your sandbox account so no additional paid account is needed.
var rcsdk2 = new ringcentral({
    server:    process.env.RINGCENTRAL_SERVER_URL_2,
    appKey:    process.env.RINGCENTRAL_CLIENT_ID_2,
    appSecret: process.env.RINGCENTRAL_CLIENT_SECRET_2
});

var platform2     = rcsdk2.platform();

platform2
    .login({
    	username:  process.env.RINGCENTRAL_USERNAME_2,
    	extension: process.env.RINGCENTRAL_EXTENSION_2,
    	password:  process.env.RINGCENTRAL_PASSWORD_2
    })
    .then(function(authResponse) {
        console.log('RC authResponse: ', authResponse.json());
        init();
    })
    .catch(function(e) {
        console.error(e);
        throw e;
    });


function init() {
    subscription.on(subscription.events.notification, function(msg) {
    	if (msg.body.telephonyStatus == "Ringing") {
    	    callerId = msg.body.activeCalls[0]['from'];
            console.log(JSON.stringify(msg.body))
            // Create custom "IVR" rule here
            if (callerId == '+16505550100') {
        	    console.log("CREATE_CUSTOM_RULE_HERE_FOR: " + callerId)
        	    createCustomCallHandlingRule(rcsdk2, callerId)
            }
        }
    });

    subscription
        .setEventFilters(['/account/~/extension/~/presence?detailedTelephonyState=true'])
        .register()
        .then(
            console.log("subscribed")
        );
}

function createCustomCallHandlingRule(rcsdk, callerId) {
    body = {
        'name':       'Custom Rule ' + callerId,
        'enabled':    true,
        'callers':    [{'callerId' : callerId}],
        'forwarding': {
            'notifyMySoftPhones':    true,
            'notifyAdminSoftPhones': false,
            'softPhonesRingCount':   5,
            'ringingMode':           'Sequentially',
            'rules': [
                {
                    'index': 1,
                    'ringCount': 3,
                    'forwardingNumbers': [
                        {'id': process.env.IVRDEMO_SPECIAL_FINAL_EXTENSION_ROUTING_EXT_FWD_NUM_ID}
                    ]
                },
            ]
        }
    }

    rcsdk.platform()
        .send({
            method: 'POST',
            url: '/account/~/extension/~/answering-rule',
            body: body
        })
    .then(function(apiResponse){
        console.log('S_CreateCustomHandlingRule ' + JSON.stringify(apiResponse.json()));
    })
    .catch(function(e){
        console.log('E_CreateCustomHandlingRule ' + e.message);

        // please note that ajax property may not be accessible if error occurred before AJAX send
        if (e.apiResponse && e.apiResponse()) {
            var request = e.apiResponse().request();

            console.log('Ajax error ' + e.message + ' for URL' + request.url + ' ' + e.apiResponse().error());
        }
    });
} 
