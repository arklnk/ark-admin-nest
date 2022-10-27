import { formatToDateTime } from './common/utils/date';

Date.prototype.toJSON = function () {
  return formatToDateTime(this);
};

Array.prototype.toPage = function (pagination) {
  return {
    list: this,
    pagination,
  };
};

Array.prototype.toList = function () {
  return {
    list: this,
  };
};
