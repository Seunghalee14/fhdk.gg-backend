"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */

const lostark = require("../../scripts/scrapers/lostark.js");
module.exports = {
  "0 * * * *": () => {
    lostark.main();
  },
  // 5 minute
  "*/5 * * * *": () => {
    lostark.deleteReport();
  },
};
