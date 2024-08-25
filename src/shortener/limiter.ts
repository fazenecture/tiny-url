import { Request, Response, NextFunction } from "express";
import customErrorHandler from "../utils/custom.error.handler";
import moment from "moment";
import ErrorHandler from "../utils/error.handler";
import { rateLimitMap } from "../index";

export const rateLimiter = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { ip: userIp } = req;
    const currentTime = moment().unix();

    if (rateLimitMap.has(userIp)) {
      const { last_request_time, request_count } = rateLimitMap.get(userIp);

      if (currentTime - last_request_time < 60) {
        if (request_count >= 10) {
          throw new ErrorHandler({
            status_code: 429,
            message: `Rate limit exceeded. Please try again after 1 minute.`,
          });
        }

        rateLimitMap.set(userIp, {
          last_request_time: currentTime,
          request_count: request_count + 1,
        });
      } else {
        rateLimitMap.set(userIp, {
          last_request_time: currentTime,
          request_count: 1,
        });
      }
    } else {
      rateLimitMap.set(userIp, {
        last_request_time: currentTime,
        request_count: 1,
      });
    }

    next();
  } catch (error) {
    customErrorHandler(res, error);
  }
};

export const initEvictionStrategy = () => {
  try {
    console.log("🚀 Rate Limit Eviction strategy initialized");
    setInterval(() => {
      const currentTime = moment().unix();
      rateLimitMap.forEach((value, key) => {
        if (currentTime - value.last_request_time > 60) {
          rateLimitMap.delete(key);
        }
      });
    }, 60000);
  } catch (error) {
    console.error("❌ Error in initEvictionStrategy: ", error);
  }
};
