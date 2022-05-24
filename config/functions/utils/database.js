const moment = require("moment");
const sha1 = require("sha1");
const { sanitizeEntity } = require("strapi-utils/lib");

async function findReport({ server }) {
  try {
    const report = await strapi.query("report").find({
      _sort: "published_at:DESC",
      _start: 0,
      _limit: 10,
      _where: { "server.name": server },
    });
    return report;
  } catch (err) {
    console.log("error while fetching", err);
  }
}

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
  findReport,
};
