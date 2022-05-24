"use strict";
const axios = require("axios");
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let request = ctx.request.body;
    // request.stoveID
    // request.authCode
    let res = await axios.get(
      `https://api.onstove.com/tm/v1/preferences/${request.stoveID}`
    );
    let data = res.data.data;

    if (data.introduce === request.authCode) {
      return { message: "인증 성공", auth: true };
    } else {
      return { message: "인증 실패", auth: false };
    }
  },
};
