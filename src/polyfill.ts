import * as dayjs from 'dayjs';

Date.prototype.toJSON = function () {
  return dayjs(this).format('YYYY-MM-DD HH:mm:ss');
};
