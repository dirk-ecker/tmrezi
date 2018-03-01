'use strict';
const Alexa = require('alexa-sdk');
const insolvenz = require('./insolvenz');
const speech = require('./speech');
const APP_ID = 'amzn1.ask.skill.fb607e9d-e998-46f2-8b02-1d2d25d2513b';

const requestHandler = function(event, context, callback) {
    console.log('event', JSON.stringify(event));
    console.log('context', JSON.stringify(context));
    const applicationId = event.session.application.applicationId;
    if (applicationId !== APP_ID) {
        callback('Ungültige Application ID');
    }
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.resources = speech.languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        // console.log('LaunchRequest');
        this.emit('WhoIsInsolvent');
    },

    'WhoIsInsolvent': function () {
        // console.log('WhoIsInsolvent');
        insolvenz.initialise();
        insolvenz.whoIsInsolvent((insolvenzData) => {
            const speechOutput = speech.createSpeechOutput.call(this, insolvenzData);
            this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), speechOutput);
        });
    },

    'WhoIsInsolventFromDate': function () {
        // console.log('WhoIsInsolventFromDate');
        const dateFromRequest = this.event.request.intent.slots.date.value;
        const dateParts = dateFromRequest.split('-');
        const date = dateParts[2] + '.' + dateParts[1] + '.' + dateParts[0];
        insolvenz.initialise();
        insolvenz.whoIsInsolventFromDate(date, (insolvenzData) => {
            // console.log('before speechOutput');
            const speechOutput = speech.createSpeechOutput.call(this, insolvenzData, dateFromRequest);
            // console.log('speechOutput', speechOutput);
            this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), speechOutput);
        });
    },

    'IsNameInsolvent': function() {
        // console.log('IsNameInsolvent');
        const name = this.event.request.intent.slots.name.value;
        insolvenz.initialise();
        insolvenz.isNameInsolvent(name, (insolvenzData) => {
            const speechOutput = speech.createSpeechOutput.call(this, insolvenzData, name);
            this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), speechOutput);
        });
    },

    'WhoIsInsolventInTown': function () {
        // console.log('\'WhoIsInsolventInTown');
        const town = this.event.request.intent.slots.town.value;
        insolvenz.initialise();
        insolvenz.whoIsInsolventInTown(town, (insolvenzData) => {
            const speechOutput = speech.createSpeechOutput.call(this, insolvenzData, town);
            this.emit(':tellWithCard', speechOutput, this.t('SKILL_NAME'), speechOutput);
        });
    },

    'AMAZON.HelpIntent': function () {
        this.emit(':ask', this.t(HELP_MESSAGE), this.t(HELP_REPROMPT));
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t(STOP_MESSAGE));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t(STOP_MESSAGE));
    },
    'Unhandled': function() {
        this.emit(':ask',
            'Entschuldigung, ich habe Dich nicht verstanden.',
            'Kannst Du das nochmal wiederholen?');
    }
};

function isSlotValid(request, slotName){
    const slot = request.intent.slots[slotName];
    //console.log("request", JSON.stringify(request));
    return (slot && slot.value) ? slot.value : false;
}

exports.handler = requestHandler;