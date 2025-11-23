import express from 'express';
import cors from 'cors';
import axios from 'axios';
import UserAgent from 'user-agents';
import { formatData, getPayoffData } from './utils.js';

const baseURL = 'https://www.nseindia.com/';

const getOptionsWithUserAgent = () => {
  const userAgent = new UserAgent();
  return {
    headers: {
      "Accept": "*/*",
      "User-Agent": userAgent.toString(),
      "Connection": "keep-alive",
    },
    withCredentials: true,
  };
};

const app = express();

// Add CORS middleware HERE
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const MAX_RETRY_COUNT = 3;

const getOptionChainWithRetry = async (cookie, identifier, retryCount = 0) => {
  const isIndex = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"].includes(identifier);
  const apiEndpoint = "api/option-chain-" + (isIndex ? "indices" : "equities");
  const options = getOptionsWithUserAgent();
  try {
    const url = baseURL + apiEndpoint + "?symbol=" + encodeURIComponent(identifier);
    const response = await axios.get(url, { ...options, headers: { ...options.headers, Cookie: cookie } });
    
    if (!response || !response.data) {
      throw new Error('No data received from NSE API');
    }
    
    const formattedData = formatData(response.data, identifier);
    return formattedData;

  } catch (error) {
    console.error(`Error fetching option chain for ${identifier}. Retry count: ${retryCount}`, error.message);
    if (retryCount < MAX_RETRY_COUNT) {
      return getOptionChainWithRetry(cookie, identifier, retryCount + 1);
    } else {
      throw new Error(`Failed to fetch option chain for ${identifier} after multiple retries`);
    }
  }
};

const getCookies = async () => {
  const options = getOptionsWithUserAgent();
  try {
    const response = await axios.get(baseURL + "option-chain", options);
    const cookie = response.headers['set-cookie'];
    
    if (!cookie) {
      throw new Error('No cookies received from NSE');
    }
    
    return Array.isArray(cookie) ? cookie.join('; ') : cookie;
  } catch (error) {
    console.error('Error fetching cookies:', error.message);
    throw new Error('Failed to fetch cookies');
  }
};

app.get('/open-interest', async (req, res) => {
  const now = new Date();
  const time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
  console.log(`Request received at ${time}`);

  const { identifier } = req.query;

  if (!identifier) {
    res.status(400).json({ error: 'Invalid request. No identifier was given.' });
    return;
  }

  try {
    const cookie = await getCookies();
    const data = await getOptionChainWithRetry(cookie, identifier.toUpperCase());
    res.json(data).status(200).end();
  } catch (error) {
    console.error('Proxy request error:', error);
    res.status(500).json({ error: 'Proxy request failed.' });
  }
});

app.post('/builder', async (req, res) => {
  const builderData = req.body;
  try {
    const payoff = getPayoffData(builderData);
    res.json(payoff).status(200).end();
  } catch (error) {
    console.error('Payoff calculation error:', error);
    res.status(500).json({ error: 'Payoff calculation failed.' });
  }
});

app.listen(6123, () => {
  console.log('Server running on port 6123');
});
