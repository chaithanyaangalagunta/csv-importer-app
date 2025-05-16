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

module.exports = {
  widgets,
  serverActions,
  version: "1.0.0",
};
