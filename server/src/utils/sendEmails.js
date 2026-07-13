import path from 'path'
import { fileURLToPath } from 'url'
import transporter from '../config/mailer.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const logoPath = path.join(__dirname, '..', 'assets', 'logo_swapit.png')

const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'logo_swapit.png',
        path: logoPath,
        cid: 'swapit-logo',
      },
    ],
  })

  console.log('Email sent successfully')
}

export default sendEmail