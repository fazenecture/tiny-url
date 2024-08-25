import Joi from "joi";
import { Request, Response, NextFunction } from "express";

import ErrorHandler from "../utils/error.handler";

export const validateUrlShortener = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = Joi.object({
      url: Joi.string().uri().required(),
    });

    req.body = await schema.validateAsync(req.body);
    next();
  } catch (error) {
    res.status(422).send({
      success: false,
      message: "Data validation failed",
      details: error,
    });
  }
};

export const validateUrlRedirect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const schema = Joi.object({
      short_url: Joi.string()
        .required()
        .custom(validatePayloadForMaliciousContent, "Sanitize input"),
    });

    req.params = await schema.validateAsync(req.params);
    next();
  } catch (error) {
    res.status(422).send({
      success: false,
      message: "Data validation failed",
      details: error,
    });
  }
};

const validatePayloadForMaliciousContent = (value: string, helpers: any) => {
  const htmlTagPattern = /<\/?[^>]+(>|$)/;
  const sqlPattern = /('|--|;|\/\*|\*\/|xp_)/i;

  if (htmlTagPattern.test(value)) {
    return helpers.message({ custom: "HTML and script tags are not allowed" });
  }

  if (sqlPattern.test(value)) {
    return helpers.message({
      custom: "Invalid input detected",
    });
  }

  return value;
};
