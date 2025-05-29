const { z } = require("zod");
const createTasksFromCsv = require("./server-actions/create-tasks-in-project.js");
const getTaskFields = require("./server-actions/get-task-fields.js");
const serverActions = [
  {
    name: "createTasksFromCsv",
    description: "Create tasks from CSV",
    run: createTasksFromCsv.run,
  },
  {
    name: "getTaskFields",
    description: "Get task fields",
    run: getTaskFields.run,
  },
];

const widgets = [
  {
    location: ["project_tab"],
    name: "Create tasks from CSV",
    description: "This is a sample widget for the projects tab",
    icon: "widgets/public/icon.svg",
    entrypoint: {
      html: "dist/index.html",
    },
    identifier: "projects-tab-sample-widget",
    // config: "inputs/projects-tab-sample.js",
  },
];

const agents = [
  {
    name: "Task creator agent",
    description: "This agent creates tasks from a CSV file",
  
  },
];

const tools = [
  {
    name: "createTasksFromCsv",
    description: "Create tasks from a CSV file",
    run: createTasksFromCsv.run,
    // arguments: [
    //   {
    //     name: "csvData",
    //     description: "The CSV data to create tasks from",
    //     type: "TEXT",
    //     required: true,
    //   },
    //   {
    //     name: "projectId",
    //     description: "The project ID to create tasks in",
    //     type: "NUMBER",
    //     required: true,
    //   },
    //   {
    //     name: "mappings",
    //     description:
    //       "The mappings of the csv columns to the task fields as a json stringified hash map of the form {csvColumn: taskField}",
    //     type: "TEXT",
    //     required: true,
    //   },
    // ],
    arguments: z.object({
      csvData: z.string().describe("The CSV data to create tasks from"),
      projectId: z.string().describe("The project ID to create tasks in"),
      mappings: z
        .string()
        .describe(
          "The mappings of the csv columns to the task fields as a json stringified hash map of the form {csvColumn: taskField}"
        ),
    }),
  },
];

module.exports = {
  widgets,
  serverActions,
  version: "1004.0.0",
  agents,
  tools,
};
