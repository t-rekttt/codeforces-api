let request = require('request-promise');
let cheerio  = require('cheerio');

let getPastContests = async(page = 1) => {
  let r = await request.get(`https://codeforces.com/contests/page/${page}`);

  let $ = cheerio.load(r);

  let contestTable = $('.contests-table .datatable');

  let contests = contestTable.find('tr').map((i, el) => {
    el = $(el);

    if (el.find('th').length) return null;

    let id = el.attr('data-contestid');

    let cells = el.find('td');

    let name = $(cells[0]).children().remove().end().text().trim();

    let writers = $(cells[1]).text().trim().replace(/                /g, '');

    let startTime = Date.parse($(cells[2]).find('.format-date').text().trim().replace(/                /g, ''));

    let length = $(cells[3]).text().trim();

    let status = $(cells[4]).text().trim();

    let participantsCount = parseInt($(cells[5]).text().trim().replace('x', ''));

    return { id, name, writers, startTime, length, status, participantsCount }
  }).get();

  return contests;
}

let getUserSubmissions = async(username = 'i_love_thuy_dung', page = 1) => {
  let r = await request.get(`https://codeforces.com/submissions/${username}/page/${page}`);

  let $ = cheerio.load(r);

  let submissionTable = $('.datatable .status-frame-datatable');

  let submissions = submissionTable.find('tr').map((i, el) => {
    el = $(el);

    if (el.find('th').length) return null;

    let cells = el.find('td');

    let id = $(cells[0]).text().trim();

    let submissionTime = Date.parse($(cells[1]).text().trim());

    let problemName = $(cells[3]).text().trim();

    let problemId = $(cells[3]).attr('data-problemid').trim();

    let lang = $(cells[4]).text().trim();

    let verdict = $(cells[5]).text().trim();

    let time = $(cells[6]).text().trim();

    let memory = $(cells[7]).text().trim();

    return { id, submissionTime, problemName, problemId, lang, verdict, time, memory }
  }).get();

  return submissions;
}

let getUpcomingContests = async() => {
  let r = await request.get(`https://codeforces.com/contests`);

  let $ = cheerio.load(r);

  let contestTable = $($('.contestList .datatable')[0]);

  let contests = contestTable.find('tr').map((i, el) => {
    el = $(el);

    if (el.find('th').length) return null;

    let id = el.attr('data-contestid');

    let cells = el.find('td');

    let name = $(cells[0]).children().remove().end().text().trim();

    let writers = $(cells[1]).text().trim().replace(/                /g, '');

    let startTime = Date.parse($(cells[2]).text().trim().replace(/                /g, ''));

    let length = $(cells[3]).text().trim();

    let status = $(cells[4]).text().trim();

    let participantsCount = parseInt($(cells[5]).text().trim().replace('x', ''));

    return { id, name, writers, startTime, length, status, participantsCount }
  }).get();

  return contests;
}

module.exports = { getPastContests, getUserSubmissions, getUpcomingContests }