const axios = require("axios");
const cheerio = require("cheerio");
const chalk = require("chalk");
var sha1 = require("sha1");
const {
  getReport,
  getDate,
  getAllSG,
  scraperCanRun,
} = require("./utils/utils.js");
const { createSiteGenerators, updateScraper } = require("./utils/query.js");
const moment = require("moment");

let report = {};
let errors = [];
let newSG = 0;

const getHtml = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};
// const url =
// "https://lostark.game.onstove.com/News/Notice/List?page=1&searchtype=0&searchtext=&noticetype=all";
// let html = await getHtml(url);
// const $ = cheerio.load(html.data);
// const $bodyList = $("#list > div.list.list--default > ul:nth-child(2) li");
// let data = []
// $bodyList.each((i, el) => {
// let type = $(el).find("li a div.list__category > span").text();
// let link = $(el).find("a").attr("href");
// link = "https://lostark.game.onstove.com" + link;
// let title = $(el).find("li a div.list__subject > span").text();
// let published = $(el).find("li a div.list__date").text();
// data.push({title, type, link, published});
// });
// newSG += 1;

// await createSiteGenerators(title, type, link, published);

const notiBoardParser = (url) => {
  return new Promise(async function (resolve, reject) {
    try {
      let html = await getHtml(url);
      resolve(html);
    } catch (e) {
      console.log("error", e);
      reject(e);
    }
  });
};

const scrape = async (allSG, scraper) => {
  let data = [];
  const url = `https://lostark.game.onstove.com/News/Notice/List?page=1&searchtype=0&searchtext=&noticetype=all`;
  let html = await getHtml(url);
  const $ = cheerio.load(html.data);
  const $bodyList = $("#list > div.list.list--default > ul:nth-child(2) li");
  $bodyList.each((i, el) => {
    let type = $(el).find("li a div.list__category > span").text();
    let link = $(el).find("a").attr("href");
    link = "https://lostark.game.onstove.com" + link;
    let title = $(el).find("li a div.list__subject > span").text();
    let published = $(el).find("li a div.list__date").text();
    let slug = sha1(link);
    var re = /전/g;
    let isAllowDate = re.test(published);
    if (isAllowDate) {
      notiBoardParser(url)
        .then((content) => {
          const $ = cheerio.load(content.data);
          let date = $(".article__date").text();
          published = moment(date, "YYYY.MM.DD").format("YYYY-MM-DD");
        })
        .catch((e) => {
          console.log("noti", e);
        });
    } else {
      published = moment(published, "YYYY.MM.DD").format("YYYY-MM-DD");
    }
    data.push({ slug, title, type, link, published });
  });
  newSG += 1;
  data.forEach(async (el) => {
    await createSiteGenerators(
      el.slug,
      el.title,
      el.type,
      el.link,
      el.published,
      scraper
    );
  });
};

const deleteReport = async () => {
  // 일정시간마다 비추천을 많이 받은 제보를 삭제
  let removeReportFind = await strapi.query("report").find({ downvote_gt: 4 });
  removeReportFind.forEach(async (el) => {
    await strapi.query("report").delete({ id: el.id });
  });
};

const main = async () => {
  const slug = "lostark-ark";
  const scraper = await strapi.query("scraper").findOne({
    slug: slug,
  });
  if (scraper == null || !scraper.enabled || !scraper.frequency) {
    console.log(
      `${chalk.red(
        "Exit"
      )}: (Your scraper may does not exist, is not activated or does not have a frequency field filled in)`
    );
    return;
  }

  const canRun = await scraperCanRun(scraper);
  if (canRun && scraper.enabled) {
    const allSG = await getAllSG(scraper);
    await scrape(allSG, scraper);
    report = await getReport(newSG);
    await updateScraper(scraper, report, errors);
  }
};

exports.main = main;
exports.deleteReport = deleteReport;
