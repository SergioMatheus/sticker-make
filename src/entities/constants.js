
const concatC_US = (number) => number.concat('@c.us');
const concatG_US = (number) => number.concat('@g.us');
const maskWithOutCountry = (number) => number.replace(/^(\d{2})(\d{2})(\d{5})(\d{4}).*/, '$1 $2 $3-$4');

const systemConst = {

  /* Admins contact */
  ADMINS: [
    concatC_US('5571988044044'),
    concatC_US('5571999145852'),
    concatC_US('5571993142784'),
    concatC_US('5571987190273'),
    concatC_US('5571993788584')
  ],

  /* Bot number */
  NUMBER_RAW: '5571984003585',
  NUMBER_ID_DEV: concatC_US('19156719392'),

  /* Group number */
  GROUP_1: concatG_US('557188044044-1494204216'),
  GROUP_2: concatG_US('557193142784-1495902162'),

  /* Signature and Social Medias */
  SIGN: `${'Stickers Automáticos?\nWPP: ', maskWithOutCountry(NUMBER.RAW)}`,
  IG: `@autofigurinhas`

}




exports.constants = systemConst, concatC_US, maskWithOutCountry;