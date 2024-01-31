require('dotenv').config({ path: './config/.env' });

import nodemailer, { Transport, Transporter } from 'nodemailer'
import path from 'path'
import ejs from 'ejs'

interface EmailOptions{
    email: string,
    subject: string,
    template: string,
    data: {[key: string]: any}
}

const sendMail = async (options: EmailOptions) : Promise<void> => {
    const transporter : Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    const {email, subject, template, data} = options

    // get the email template path
    const templateFilePath = path.join(__dirname, '../templates', template)

    // render the email path
    const html: string = await ejs.renderFile(templateFilePath, {data:data})

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email, 
        subject,
        html
    }

    await transporter.sendMail(mailOptions)
}

export default sendMail;