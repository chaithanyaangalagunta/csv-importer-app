const csvtojsonV2 = require("csvtojson");

const mapTaskFields = (json, mappings) => {
  const mappedTask = { fields: [] };
  Object.keys(mappings).forEach((csvColumn) => {
    const fieldId = mappings[csvColumn];
    if (json[csvColumn]) {
      if (fieldId?.toString()?.length > 0) {
        if (Number.isFinite(fieldId)) {
          mappedTask.fields.push({
            fieldId: fieldId,
            value: json[csvColumn],
          });
        } else {
          mappedTask[fieldId] = json[csvColumn];
        }
      }
    }
  });
  // if any of the keys are empty, remove them
  Object.keys(mappedTask).forEach((key) => {
    if (mappedTask[key] === "") {
      delete mappedTask[key];
    }
  });
  return mappedTask;
};

const run = async (r, args) => {
  try {
    const payload = args.payload;
    const csvData = payload.csvData;
    const mappings = payload.mappings;
    const projectId = payload.projectId;
    const json = await csvtojsonV2().fromString(csvData);
    const mappedTasks = json.map((task) => mapTaskFields(task, mappings));
    console.log(JSON.stringify(mappedTasks));

    console.log(`Creating ${mappedTasks.length} tasks in project ${projectId}`);

    // create task logic here

    return {
      success: true,
      message: `Created ${mappedTasks.length} tasks in project ${projectId}`,
    };
  } catch (error) {
    console.error("Error creating tasks:", error);
    throw error;
  }
};

module.exports = {
  run,
};
