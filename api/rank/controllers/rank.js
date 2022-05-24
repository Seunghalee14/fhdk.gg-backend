"use strict";

const { sanitizeEntity } = require("strapi-utils/lib");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let request = ctx.request.body;
    let now = new Date();

    let server_name;
    switch (request.server) {
      case "Lufeon":
        server_name = "루페온";
        break;
      case "Silian":
        server_name = "실리안";
        break;
      case "Aman":
        server_name = "아만";
        break;
      case "Karmain":
        server_name = "카마인";
        break;
      case "Kazeros":
        server_name = "카제로스";
        break;
      case "Abrelshud":
        server_name = "아브렐슈드";
        break;
      case "Kardan":
        server_name = "카단";
        break;
      case "Ninave":
        server_name = "니나브";
        break;
    }
    let firstDay = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      2
    ).toISOString();

    let lastDay = new Date(
      now.getFullYear(),
      now.getMonth() - 0,
      1
    ).toISOString();

    let reports = await strapi.query("report").find({
      created_at_gte: firstDay,
      created_at_lte: lastDay,
      "server.name": server_name,
    });

    let report_data = [];
    // If the user ID is the same, duplicate counts are required.
    reports.map((item) => {
      if (
        report_data.find((report) => {
          if (report.user_id === item.user_id) {
            report.count++;
            report.upvote++;
            return true;
          } else {
            return false;
          }
        })
      ) {
      } else {
        item.count = 1;
        report_data.push({
          user_id: item.user_id,
          count: item.count,
          upvote: item.upvote,
        });
      }
    });

    let report_sort = report_data.sort(function (a, b) {
      return b.count - a.count;
    });

    for (let i = 0; i < report_sort.length; i++) {
      let user_id = report_sort[i].user_id;

      let findUser = await strapi
        .query("user", "users-permissions")
        .findOne({ id: user_id });

      report_sort[i].username = findUser.username;
      report_sort[i].email = findUser.email;
    }

    return report_sort.slice(0, 10);
  },
};
