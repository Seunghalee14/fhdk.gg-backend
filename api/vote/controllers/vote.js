"use strict";
const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let request = ctx.request.body;
    let check_report = await strapi
      .query("report")
      .findOne({ uid: request.report_id });

    let findVote = await strapi.query("vote").findOne({
      report_id: request.report_id,
      user_id: ctx.state.user && ctx.state.user.id,
    });

    if (check_report) {
      switch (request.vote) {
        case "up":
          if (findVote) {
            if (findVote.is_upvote) {
              check_report.upvote -= 1;
              await strapi.query("vote").delete({ id: findVote.id });
              check_report.vote = null;
            } else {
              check_report.upvote += 1;
              check_report.downvote -= 1;
              await strapi
                .query("vote")
                .update({ id: findVote.id }, { is_upvote: true });
              check_report.vote = true;
            }
          } else {
            check_report.upvote += 1;
            await strapi.query("vote").create({
              report_id: request.report_id,
              user_id: ctx.state.user && ctx.state.user.id,
              is_upvote: true,
            });
            check_report.vote = true;
          }
          break;
        case "down":
          if (findVote) {
            if (findVote.is_upvote) {
              check_report.upvote -= 1;
              check_report.downvote += 1;
              await strapi
                .query("vote")
                .update({ id: findVote.id }, { is_upvote: false });
              check_report.vote = false;
            } else {
              check_report.downvote -= 1;
              await strapi.query("vote").delete({ id: findVote.id });
              check_report.vote = null;
            }
          } else {
            check_report.downvote += 1;
            await strapi.query("vote").create({
              report_id: request.report_id,
              user_id: ctx.state.user && ctx.state.user.id,
              is_upvote: false,
            });
            check_report.vote = false;
          }
          break;
        default:
          break;
      }
    } else {
      return ctx.badRequest(
        null,
        formatError({
          message: "제보를 찾을 수 없습니다.",
        })
      );
    }
    let entity = await strapi
      .query("report")
      .update({ uid: request.report_id }, check_report);
    if (check_report.vote !== null) {
      entity.vote = check_report.vote;
    }
    return sanitizeEntity(entity, { model: strapi.models.report });
  },
};
