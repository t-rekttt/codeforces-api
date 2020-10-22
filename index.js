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

let getGroupContestsList = async(groupName = 'FLVn1Sc504') => {
  let url = `https://codeforces.com/group/${groupName}/contests`;

  let r = await request.get(url);

  let $ = cheerio.load(r);

  let lines = $('.datatable table tbody tr');

  let contests = lines.map((i, el) => {
    el = $(el);

    let cells = el.find('td');

    let name = $(cells[0]).children().remove().end().text().trim();

    let contestId = el.attr('data-contestid');

    let startTime = Date.parse($(cells[1]).find('a').children().remove().end().text().trim());

    let length = $(cells[2]).text().trim();

    let url = `https://codeforces.com/group/${groupName}/contest/${contestId}`;

    return {
      name,
      contestId,
      startTime,
      length,
      url
    }
  }).get();

  contests.shift();

  return contests;
}

let getProblemsListInGroupContest = async(groupName = 'FLVn1Sc504', contestListId = '274766') => {
  let url = `https://codeforces.com/group/${groupName}/contest/${contestListId}`;

  let r = await request.get(url);

  let $ = cheerio.load(r);

  let lines = $('.problems tr');

  let problems = lines.map((i, el) => {
    el = $(el);

    let cells = el.find('td');

    let problem = $(cells[0]).text().trim();

    let name = $(cells[1]).find('a').text().trim();

    let url = 'https://codeforces.com' + $(cells[1]).find('a').attr('href');

    let solvedCounts = parseInt($(cells[3]).find('a').text().trim().replace('x', '')) || 0;

    return {
      problem,
      url,
      name,
      solvedCounts
    }
  }).get();

  problems.shift();

  return problems;
}

let getSubmissionsInGroupContest = async(groupName = 'FLVn1Sc504', contestId = '274821', problem = 'L', participant) => {
  let url = `https://codeforces.com/group/${groupName}/contest/${contestId}/status/${problem}`;

  let jar = request.jar();

  let r = await request.get(url, {
    resolveWithFullResponse: true,
    jar
  });

  let $ = cheerio.load(r.body);

  let csrfToken = $('.csrf-token').attr('data-csrf');

  if (participant) {
    r = await request.post(url, {
      jar,
      form: {
        action: 'setupSubmissionFilter',
        frameProblemIndex: problem,
        verdictName: 'anyVerdict',
        programTypeForInvoker: 'anyProgramTypeForInvoker',
        comparisonType: 'NOT_USED',
        judgedTestCount: '',
        participantSubstring: participant,
        csrf_token: csrfToken
      },
      followAllRedirects: true
    });
  } else {
    r = r.body;
  }

  let lines = $('table.status-frame-datatable tr:not(.first-row)');

  return lines.map((i, el) => {
    el = $(el);

    let cells = el.find('td');

    let submissionId = $(cells[0]).text().trim();

    let submissionTime = Date.parse($(cells[1]).text().trim());

    let problemId = $(cells[3]).attr('data-problemid');

    let user = $(cells[2]).text().trim();

    let problemName = $(cells[3]).text().trim();

    let lang = $(cells[4]).text().trim();

    let verdict = $(cells[5]).text().trim();

    return {
      submissionId,
      submissionTime,
      user,
      problemName,
      problemId,
      lang,
      verdict
    }
  }).get();
}

module.exports = { getPastContests, getUserSubmissions, getUpcomingContests, getSubmissionsInGroupContest, getProblemsListInGroupContest, getGroupContestsList }