"use strict";

const chalk = require("chalk");

const createSiteGenerators = async (
  slug,
  title,
  type,
  link,
  published,
  scraper
) => {
  try {
    await strapi.query("notice").create({
      slug,
      type,
      title,
      link,
      published,
      scraper: scraper.id,
    });
  } catch (e) {
    console.log(e);
  }
};

const updateScraper = async (scraper, report, errors) => {
  await strapi.query("scraper").update(
    {
      id: scraper.id,
    },
    {
      report: report,
      error: errors,
    }
  );

  console.log(`Job done for: ${chalk.green(scraper.name)}`);
};

module.exports = {
  createSiteGenerators,
  updateScraper,
};
