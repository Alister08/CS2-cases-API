# Cs2 API cases
API to fetch Counter Strike 2 cases price data in USD and INR 
<p> <b> CONTACT ME FOR .env files at </b> </p>

 alisteralex0810@gmail.com 


``` npm i ``` to install the node_modules
# POST API endpoint
/api/case 
<p> eg: http://localhost:3000/api/case </p>

# Example POST API call Json body
```
{
  "case": "Dreams & Nightmares Case"
}
```

# Expected Response
```
{
  "buy_req_usd": 1.88,
  "sell_req_usd": 1.9,
  "buy_req_inr": "162.94",
  "sell_req_inr": "164.67",
  "nameid": "176288467"
}
```
