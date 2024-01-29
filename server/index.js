const express = require('express');
const cors = require('cors');


const port = 5000;
const app = express();

app.use(cors({ origin: '*' }))
app.options('*', cors());

app.use(express.json());

const { EmailClient } = require("@azure/communication-email");

const connectionString = "endpoint=https://luvnowcommunication.communication.azure.com/;accesskey=sEb3AXH0OJIQrb6ED8tnyBTjYg+oNr/Tx6IGq8L4S6IKykKudaUZ18scU6ZmVmuXzdhD6arfhx+KY8qUZN9Ucw==";
const client = new EmailClient(connectionString);
const sender = "DoNotReply@luvnow.nl";

// routes middleware
app.post('/api/send-email', async (req, res) => {
   const { name, email, phone, alternateNumber, country, city, message } = req.body
   // let name = "Pradeep Bande"
   // let email = "pradeep@agomic.com"
   // let phone = "+91-7620069935"
   // let alternateNumber = '-'
   let subject = "Contact Us"
   const html = `<html>
         <head>
         <title>Contact Us</title>
         </head>
         <body>
            <h2>Luvnow.nl - Contact us Lead</h2>
            <h2>The User wants to contact.</h2>
            <h3>Please, check the following information: </h3>
            <h4>Name: ${name}</h4>
            <h4>Email: ${email}</h4>
            <h4>Phone: ${phone}</h4>
            <h4>Alternate Number: ${alternateNumber}</h4>
            <h4>Country: ${country}</h4>
            <h4>City: ${city}</h4>
            <p>Message: ${message}</p>
         </body>
      </html>`

   const emailContent = {
      subject,
      html
   };

   const toRecipientsList = {
      to: [{ email: "info@luvnow.nl", displayName: "Luvnow Admin" }],
      cC: [{ email: "pradeep@agomic.com", displayName: "Pradeep Bande" },
      {
         email: "kunaltomar@agomic.com",
         displayName: "Kunal Tomar",
      },
      {
         email: "jitendrabakoria@agomic.com",
         displayName: "Jitendra Bakoria",
      },
      {
         email: "naman@agomic.com",
         displayName: "Naman Shrivastava",
      },
      ],
   };

   try {
      const emailMessage = {
         sender: sender,
         content: emailContent,
         recipients: toRecipientsList,
      };

      const sendResult = await client.send(emailMessage);

      if (sendResult && sendResult.messageId) {
         // check mail status, wait for 5 seconds, check for 60 seconds.
         const messageId = sendResult.messageId;
         if (messageId === null) {
            console.log("Message Id not found.");
            return;
         }

         console.log("Send email success, MessageId :", messageId);

         let counter = 0;
         const statusInterval = setInterval(async function () {
            counter++;
            try {
               const response = await client.getSendStatus(messageId);
               if (response) {
                  console.log(`Email status for {${messageId}} : [${response.status}]`);
                  if (response.status.toLowerCase() !== "queued" || counter > 12) {
                     clearInterval(statusInterval);
                  }
               }
            } catch (e) {
               console.log("Error in checking send mail status: ", e);
            }
         }, 5000);
      } else {
         console.error("Something went wrong when trying to send this email: ", sendResult);
      }
   } catch (e) {
      console.log("################### Exception occoured while sending email #####################", e);
   }
   res.json({
      code: 'success'
   })
});

app.get('/api/server', (req, res) => {
   res.json({ message: "Luvnow server is running" })
})

//Invalid route handling
app.use((req, res, next) => {
   const error = new Error('Not Found')
   error.status = 404
   next(error)
})

app.use((error, req, res, next) => {
   res.status(error.status || 404)
   res.json({
      error: error.message
   })
})

// Server start
app.listen(port, () => {
   console.log(`Server is running on port ${port}`);
});
