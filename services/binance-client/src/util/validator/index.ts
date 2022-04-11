const Sentry = require("../../config/sentry");

export const validateObject = (obj: any) => {
  for (const key in obj) {
    if (obj[key] == undefined || obj[key] == null || obj[key] == '') {
      Sentry.captureException(`Error occured, ${JSON.stringify(key)} not valid.`);
      return false;
    }
  }
  return true
}
