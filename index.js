

const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Function to get exchange rate from USD to INR
const getExchangeRate = async () => {
    try {
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        return response.data.rates.INR;
    } catch (error) {
        console.error("Error fetching exchange rate:", error.message);
        return null;
    }
};

// Function to get nameid from Steam Market
const getNameId = async (hashname) => {
    try {
        // console.log(`Fetching nameid for: ${hashname}`);
        const response = await axios.get(`${process.env.STEAM_API_URL}${hashname}`, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
              'Cache-Control': 'no-cache'
            }
        });
        
        // console.log("Steam Market Response:", response.data.substring(0, 500)); // Print first 500 chars for debugging
        
        const match = response.data.match(/Market_LoadOrderSpread\(\s*(\d+)\s*\)/);
        if (!match) throw new Error("Name ID not found");
        
        // console.log("Extracted Name ID:", match[1]);
        return match[1];
    } catch (error) {
        console.error("Error fetching nameid:", error.message);
        return null;
    }
};

// Function to fetch item data from Steam Market and convert price to INR
const getItemData = async (hashname) => {
    try {
        const nameid = await getNameId(hashname);
        if (!nameid) throw new Error("Name ID missing");

        // console.log(`Fetching buy/sell data for Name ID: ${nameid}`);

        const orderResponse = await axios.get(
            `${process.env.STEAM_ITEMDATA_URL}${nameid}`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );

        const orderData = orderResponse.data; // No need for regex
        // console.log("Order Data Response:", orderData);

        // Extract values from JSON object
        const buyReq = orderData.highest_buy_order ? parseInt(orderData.highest_buy_order) / 100 : null;
        const sellReq = orderData.lowest_sell_order ? parseInt(orderData.lowest_sell_order) / 100 : null;

        // Get exchange rate to convert USD to INR
        const exchangeRate = await getExchangeRate();
        const buyReqINR = buyReq ? (buyReq * exchangeRate).toFixed(2) : null;
        const sellReqINR = sellReq ? (sellReq * exchangeRate).toFixed(2) : null;

        return { buy_req_usd: buyReq, sell_req_usd: sellReq, buy_req_inr: buyReqINR, sell_req_inr: sellReqINR, nameid };
    } catch (error) {
        console.error("Error fetching buy/sell orders:", error.message);
        return { error: "Item data not available" };
    }
};

// API endpoint for cases
app.post('/api/case', async (req, res) => {
    try {
        const { case: caseName } = req.body;
        if (!caseName) return res.status(400).json({ error: "Case name is required" });
        
        const hashname = encodeURIComponent(caseName);
        // console.log("Encoded Case Name:", hashname);
        const data = await getItemData(hashname);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
