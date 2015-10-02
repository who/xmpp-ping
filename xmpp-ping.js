#!/usr/bin/env node

var uuid = require('uuid')
var program = require('commander')
var Client = require('node-xmpp-client')
var ltx = require('ltx')

program
    .option('-d, --XMPPDomain [value]', 'the XMPP domain to connect to')
    .option('-j, --JID [value]', 'JID of user to connect with')
    .option('-p, --password [value]', 'password of user user. defaults to "password"')
    .option('-r, --pingRate [value]', 'ms rate at which to ping the server. defaults to 1000')
    .option('-x, --exitOnError [value]', 'boolean to exit on error or not. defaults to true')
    .parse(process.argv);

var XMPPDomain = program.XMPPDomain;
var JID = program.JID;
var accountPassword = program.password;
var pingRate = program.pingRate || 1000;
var exitOnError = program.exitOnError || true;

if (typeof XMPPDomain === 'undefined' || typeof JID === 'undefined') {
   program.help();
   process.exit(1);
}

var client = new Client({
    jid: JID,
    password: accountPassword,
    host: XMPPDomain
})

client.on('online', function() {
    console.log('Connection successfull. Will now begin pinging at a rate of 1 ping per '+pingRate+'ms');
    setInterval(function() {
        var pingStanza = new ltx.Element('iq', {
                from: JID,
                to: XMPPDomain,
                type: "get",
                id: uuid()
            })
            .c('ping', {
                xmlns: 'urn:xmpp:ping'
            });

        console.log('Sending ping stanza:');
        console.log(pingStanza.root().toString());
        client.send(pingStanza);
    }, pingRate);
})

client.on('stanza', function(stanza) {
    console.log("Received stanza:")
    console.log(stanza.root().toString());
})

client.on('error', function(e) {
    console.error(e);
    if (exitOnError === true) {
        console.log("Exiting process");
        process.exit(1);
    }
})