import * as cheerio from 'cheerio';
import axios from 'axios';
const fetchSeats = async (
  term: string,
  crn: number
): Promise<
  [number, number, number, number] | [string, string, string, string]
> => {
  const url =
    'https://oscar.gatech.edu/pls/bprod/' +
    `bwckschd.p_disp_detail_sched?term_in=${term}` +
    `&crn_in=${crn}`;

  return await axios({
    url: `https://cors-anywhere.herokuapp.com/${url}`,
    method: 'get',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'text/html',
    },
  })
    .then(response => {
      const $ = cheerio.load(response.data);
      const availabilityTable = $('.datadisplaytable .datadisplaytable');
      const tableRow = availabilityTable.find('tr');

      return [
        parseInt(tableRow.eq(1).children('td').first().text(), 10),
        parseInt(tableRow.eq(1).children('td').eq(1).text(), 10),
        parseInt(tableRow.eq(2).children('td').first().text(), 10),
        parseInt(tableRow.eq(2).children('td').eq(1).text(), 10),
      ] as [number, number, number, number];
    })
    .catch(() => ['N/A', 'N/A', 'N/A', 'N/A']);
};

const getDaysRemaining = (firstDate: Date, secondDate: Date) => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  return Math.round(
    Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay)
  );
};

const main = async () => {
  const TERM = '202102';
  const END_OF_PHASE_I = new Date(2020, 11, 11);
  const DESIRED_CRNS: [number, string][] = [
    [34008, 'Online Communities'],
    [34014, 'Intro to Cog Sci'],
    [35012, 'Animal Interaction'],
  ];
  await Promise.all(
    DESIRED_CRNS.map(async ([crn, name]) => {
      const [
        capacity,
        actual,
        waitlistCapacity,
        waitlistActual,
      ] = await fetchSeats(TERM, crn);
      console.log(`${crn}: ${name}`);
      console.log(`${actual}/${capacity} seats filled.`);
      console.log(
        `${waitlistActual}/${waitlistCapacity} spots taken on waitlist.`
      );
      console.log('=======================================');
    })
  );
  console.log(
    `The end of Phase I registration is ${END_OF_PHASE_I.toLocaleDateString()}, only ${getDaysRemaining(
      new Date(),
      END_OF_PHASE_I
    )} days left!`
  );
};

main();
