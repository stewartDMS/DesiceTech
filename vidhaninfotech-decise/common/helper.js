var path = require('path');
var fs = require("fs");
const CONFIG = require("./../config");
const { format, parse, addMonths } = require("date-fns");
var nodemailer = require('nodemailer');
const axios = require('axios');

/*
 * Send OTP
 * @parm {object} params
 *                            @params.to : pass mobile no whom send otp
 *                            @params.token : pass token in sms
 * @return {[type]} [description]
 */
exports.sendOtp = function (params, callback) {
    console.log("OTP params========================================================================= : ", params);
    let message = "Your NUCARE New OTP is " + params.token;

    axios.get("https://www.smsidea.co.in/smsstatuswithid.aspx?mobile=7567359398&pass=vijay&senderid=NUCARE&to=" + params.to + "&msg=" + encodeURIComponent(message))
        .then(response => {
            callback(null, "Sent successfully....");
        })
        .catch(error => {
            callback(error);
        });
};

/*
 * Send custom mail
 * @parm {object} params
 *                            @params.to : pass email id to whom send email
 *                            @params.subject : pass subject name of email
 *                            @params.message : pass email template body without header and footer
 *                            @params.fs : pass file system module's object
 *                            @params.domainUrl : pass url of domain.
 * @return {[type]} [description]
 */
exports.sendCustomEmail = function (params, callback) {
    //Include nodejs mailer and smtp module

    //Get email template
    var emailTemplatesHtml = fs.readFileSync(path.join(__dirname, "../../client/emailTemplates/emailTemplates.html")).toString();

    var hostName = `${CONFIG.APP.WEB.PROTOCOL}://${CONFIG.APP.WEB.HOST}:${CONFIG.APP.WEB.PORT}`;

    var message = emailTemplatesHtml.replace(/##DYNAMIC_EMAIL_HTML##/g, params.message);
    message = message.replace(/##DOMAIN_URL##/g, hostName);

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: CONFIG.APP.SMTP.HOST,
        //port: 25,
        //port: 465,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: CONFIG.APP.SMTP.USER,
            pass: CONFIG.APP.SMTP.PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    transporter.sendMail({
        from: CONFIG.APP.SMTP.MAIL_FROM,
        to: params.to, // receiver
        subject: CONFIG.APP.SMTP.SITE_TITLE + " : " + params.subject,
        html: message // body
    }, function (error, response) { //callback
        callback(error, response);
    });
};

/*
 * Get email main body by html file name
 */
exports.getMainEmailTemplate = function (params, callback) {
    var emailTemplatesHtml = "";
    if (!!params.templateName) {
        emailTemplatesHtml = fs.readFileSync(path.join(__dirname, "../../client/emailTemplates/" + params.templateName)).toString();
    }
    callback(emailTemplatesHtml);
};

const parseDateString = (date) => {
    return parse(date, "dd/MM/yyyy, hh:mm:ss", new Date());
}

exports.getDatefromNumberValue = (from, months) => {
    from = parseDateString(from);
    return addMonths(from, months);
}

