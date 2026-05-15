import mongoSanitize from 'express-mongo-sanitize';

export const safeSanitize = (req, res, next) => {
  const queryCopy = JSON.parse(JSON.stringify(req.query));
  const bodyCopy = JSON.parse(JSON.stringify(req.body));
  const paramsCopy = JSON.parse(JSON.stringify(req.params));

  mongoSanitize.sanitize(queryCopy);
  mongoSanitize.sanitize(bodyCopy);
  mongoSanitize.sanitize(paramsCopy);

  req.body = bodyCopy;
  req.params = paramsCopy;
  
  req.safeQuery = queryCopy;

  next();
};