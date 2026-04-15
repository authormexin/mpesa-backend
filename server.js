const express = require("express");
const axios = require("axios");
const cors = require("cors");
const moment = require("moment");

const app = express();
app.use(express.json());
app.use(cors());

// 🔑 Replace later with real Safaricom credentials
const consumerKey = "YOUR_CONSUMER_KEY";
const consumerSecret = "YOUR_CONSUMER_SECRET";
const shortcode = "YOUR_SHORTCODE";
const passkey = "YOUR_PASSKEY";

async function getAccessToken() {
  const url =
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  const response = await axios.get(url, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  return response.data.access_token;
}

app.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount } = req.body;

    const token = await getAccessToken();

    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    const data = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: "https://your-backend-url.com/callback",
      AccountReference: "Shop Payment",
      TransactionDesc: "Purchase",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json(error.message);
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
