"use strict";
const moment = require("moment");
const sha1 = require("sha1");
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const getClosestData = (data, current_time) => {
  let current_data = {};
  let next_data = {};
  let event_status = false;

  let current_time_ms = moment(current_time, "HH:mm:ss").toDate();
  let current_data_ms = 0;
  let next_data_ms = 0;
  data.forEach((data) => {
    let data_end_time = moment(data.end, "HH:mm:ss").toDate();
    let data_start_time = moment(data.start, "HH:mm:ss").toDate();
    if (
      current_time_ms <= data_end_time &&
      current_time_ms >= data_start_time
    ) {
      current_data = data;
      event_status = true;
    } else if (current_time_ms <= data_start_time) {
      if (current_time_ms >= next_data_ms) {
        next_data = data;
        next_data_ms = data_start_time;
      }
    } else if (current_time_ms >= data_end_time) {
      if (current_time_ms <= current_data_ms) {
        current_data = data;
        current_data_ms = data_end_time;
      }
    }
  });

  if (!event_status && next_data.id === undefined) {
    let current_time_ms = moment("00:00", "HH:mm:ss").toDate();
    data.forEach((data) => {
      let data_end_time = moment(data.end, "HH:mm:ss").toDate();
      let data_start_time = moment(data.start, "HH:mm:ss").toDate();
      if (
        current_time_ms <= data_end_time &&
        current_time_ms >= data_start_time
      ) {
        current_data = data;
        event_status = true;
      } else if (current_time_ms <= data_start_time) {
        if (current_time_ms >= next_data_ms) {
          next_data = data;
          next_data_ms = data_start_time;
        }
      } else if (current_time_ms >= data_end_time) {
        if (current_time_ms <= current_data_ms) {
          current_data = data;
          current_data_ms = data_end_time;
        }
      }
    });
  }
  return { event_status, current_data, next_data };
};

module.exports = {
  async find(ctx) {
    // ctx.query = updated_at_gte
    // 현재 시간보다 클때
    let reports = await strapi.services.report.find({ ...ctx.query });

    if (ctx.state.user && ctx.state.user.id) {
      reports = await Promise.all(
        reports.map(async (report) => {
          let findVote = await strapi
            .query("vote")
            .findOne({ report_id: report.uid, user_id: ctx.state.user.id });

          if (findVote) {
            if (report.uid === findVote.report_id) {
              if (findVote.is_upvote) {
                report.vote = true;
              } else {
                report.vote = false;
              }
            }
          }
          return report;
        })
      );
    }

    return sanitizeEntity(reports, { model: strapi.models.report });
  },
  async create(ctx) {
    let request = ctx.request.body;
    let date = moment().format("YYYY-MM-DD HH");
    let report_time = moment().format("HH:mm:ss.SSS");
    const uuid = sha1(
      `${date}-${request.server[0]}-${request.continent[0]}-${request.territory[0]}-${request.itemfavor[0]}-${request.itemcard[0]}`
    );

    request.uid = uuid;
    request.report_date = report_time.toString(); 
    if (ctx.state.user) {
      request.user_id = ctx.state.user.id;
    }

    let report_time_check = await strapi.services.periodicevent.find();
    let event_check = getClosestData(report_time_check, report_time);

    if (event_check.event_status) {
      let dupcheck = await strapi.query("report").findOne({ uid: request.uid });
      let entity;
      if (dupcheck !== null) {
        entity = await strapi
          .query("report")
          .update(
            { uid: dupcheck.uid },
            { ...request, count: parseInt(dupcheck.count) + 1 }
          );
      } else {
        entity = await strapi.services.report.create(request);
      }
      return sanitizeEntity(entity, { model: strapi.models.report }); 
    } else {
      return { message: "지금은 제보시간이 아닙니다" };
    }
  },
};
