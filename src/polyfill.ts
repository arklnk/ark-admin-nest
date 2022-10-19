import dayjs from 'dayjs';

Date.prototype.toJSON = function () {
  return dayjs(this).format('YYYY-MM-DD HH:mm:ss');
};

Array.prototype.toPage = function (pagination) {
  return {
    list: this,
    pagination,
  };
};
