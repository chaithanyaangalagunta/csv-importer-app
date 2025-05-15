const axios = require("axios");

const getTaskFields = async () => {
  let allFields = [];
  let url = "https://api.rocketlane.com/api/1.0/fields";
  let hasMore = true;
  let nextPageToken = null;

  while (hasMore) {
    console.log("Fetching fields", url);
    const response = await axios.get(url, {
      headers: {
        accept: "application/json",
        "api-key": "rl-0d7bb281-fb49-482a-85b7-ac99a29db77b",
      },
    });

    if (response.data && Array.isArray(response.data.data)) {
      allFields = allFields.concat(response.data.data);
    }

    const pagination = response.data.pagination;
    hasMore = pagination && pagination.hasMore;
    nextPageToken = pagination && pagination.nextPageToken;

    if (hasMore && nextPageToken) {
      url = `https://api.rocketlane.com/api/1.0/fields?pageToken=${encodeURIComponent(
        nextPageToken
      )}`;
    }
  }

  const taskFields = allFields.filter((field) => field.objectType === "TASK");
  return taskFields;
};

const run = async (r, args) => {
  const response = await getTaskFields();
  return response;
};

module.exports = {
  run,
};
