# RingCentral IVR Data Demo Demo

Route an incoming call based on account look up with Caller ID.

## Overview

### Have 2 accounts:

* Account #1: primary account with Inbound Extension and Final Extensions (Default and Special)
* Account #2: special account for IVR routing extension

### Have 3 extensions:

* Inbound Extension (Account #1) - where all users initially end up. This account will have:
  * Static forwarding rule to
    * (a) send to a phone that never answers and place the call on hold while the routing is being determined and
    * (b) a forwarding rule to the routing extension Direct Number
* Routing Extension (Account #2) - extension that routes users between departments. This rule will have the following rules:
  * two static forwarding numbers, one the Final Default Extension and one ot the Final Special Extension.
  * a static forwarding rule to go to the Final Default Extension
  * dynamically created (and deleted) rules to direct specific Caller Id values ot the Final Special Extension
* Final Special Extension (Account #1) - where special customers end up.
  * Direct Number that can be reached directly from an outside account is needed
* Final Default Extension (Account #1) - where all callers end up without additional routing.
  * Direct Number that can be reached directly from an outside account is needed

### Have 1 application:

* Listen for presence vents on Inbound Extension. When a call is received, look up caller id value in database.
* Create Custom Forwarding Rule based on Caller Id if Caller Id indicates Final Special Extension handling.

## Inbound call flow:

1. User calls into Inbound Extension #1 which attempts to connect the user to a non-answering phone.
1. App receives presence event with Caller ID
1. App looks up database record with Caller ID
1. If the account is a special account, the app creates an advanced call handling rule on the Routing Extension to direct the Caller ID to the Final Special Extension
1. Forwarding rule on Inbound Extension to Non-Answering Phone expires and user is forwarded to Routing Extension. Routing extension runs call against advanced call handling rules and routes call.

## Configuration/Deployment Steps

1. Create Final Default Extension on Account 1
  1. Create Direct Number on Final Default Extension
2. Create Final Special Extension on Account 2
  1. Create Direct Number on Final Special Extension
3. Create Routing Extension on Account 2
  1. Create Direct Number on Routing Extension
  2. Create Forwarding Number to Final Default Extension Direct Number on Routing Extension
  3. Create Forwarding Number to Final Special Extension Direct Number on Routing Extension
  4. Create Forwarding Rule to Final Default Extension on Routing Extension
  5. Set Business Hours to 24 hrs.
4. Create Inbound Extension on Account 1
  1. Create Inbound Extension Phone
  2. Create Forwarding Number to Routing Number
  3. Create Forwarding Rule Phone to Inbound Extension Phone
  4. Create Forwarding Rule Phone to Routing Extension Phone
  5. Set Business Hours to 24 hrs.
5. Create App
  1. Create Subscription for inbound calls on Inbound Extension
  2. When Caller Id is seen, create Custom Forwarding Rule on Routing Extension
6. Make Call
  1. Login into Default Final Extension and Special Final Extension.
  2. Make inbound call to Inbound Extension with special handling Caller Id

## Installation

```bash
$ git clone https://github.com/grokify/ringcentral-ivr-data-dip-demo
$ cd ringcentral-ivr-data-dip-demo
$ npm install
$ cp sample.env .env
$ vi .env
$ npm start
```

## Detailed Steps How-To

### Create a Direct Number

This is a manual process that needs to be done in the Online Account Portal. Save the numbers that have been created. There should be at least 3 Direct Numbers in this demo.

### Create Forwarding Number

On the Routing Extension, create two forwarding numbers, for each of the final extensions.

In addition to the HTTP calls below, you can use the sample code in [`cli.js`](cli.js) or in [`answering_rules.rb`](https://github.com/grokify/ringcentral-sdk-ruby/blob/master/scripts/answering-rules.rb).

```
POST /restapi/v1.0/account/~/extension/~/forwarding-number HTTP/1.1

{
  "phoneNumber" : "+16505550111",
  "label" : "Default Call Queue"
}
```

```
POST /restapi/v1.0/account/~/extension/~/forwarding-number HTTP/1.1

{
  "phoneNumber" : "+16505550112",
  "label" : "Special Call Queue"
}
```

### Create a Forwarding Rule

You can do this manually or see the example code in [`answering_rules.rb`](https://github.com/grokify/ringcentral-sdk-ruby/blob/master/scripts/answering-rules.rb).

### Create a Custom Forwarding Rule

This step needs to be performed programmatically in your app when a new number is encountered. You can see this in [`app.js`](app.js).

For stand-alone code, you can see the example code in [`answering_rules.rb`](https://github.com/grokify/ringcentral-sdk-ruby/blob/master/scripts/answering-rules.rb).
