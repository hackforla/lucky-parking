import morgan from "morgan";

const format =
  ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"\n';

const options = {};

export default morgan(format, options);
