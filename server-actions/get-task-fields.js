const axios = require("axios");

/**
 * 
 * curl 'https://smartidly.api.rocketlane.com/api/v1/all-fields' \
  -H 'api-key: d4d29dea-6071-4793-94ff-e04b1444982e' \
  -H 'Referer;' \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36' \
  -H 'accept: application/json' \
  -H 'DNT: 1'
 */

const getTaskFields = async () => {
  const response = await axios.get(
    "https://smartidly.api.rocketlane.com/api/v1/all-fields",
    {
      headers: {
        "api-key": "rl-0d7bb281-fb49-482a-85b7-ac99a29db77b",
      },
    }
  );
  return response.data?.find((e) => e.objectType === "TASK")?.fields;
};

const run = async (r, args) => {
  const response = await getTaskFields();
  console.log(response);
  return response;
};

module.exports = {
  run,
};
