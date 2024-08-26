import {
  IClickTrackingObj,
  ILongUrlObj,
  IShortUrlObj,
  IUrlRedirectReqObj,
  IUrlShortenerReqObj,
} from "./types/interface";
import ShortenerHelper from "./helper";
import { v4 } from "uuid";
import moment from "moment";
import ErrorHandler from "../utils/error.handler";
import { producer } from "..";
import { QueueMessageType } from "./types/enum";

export default class ShortenerService extends ShortenerHelper {
  public urlShortenerService = async (reqObj: IUrlShortenerReqObj) => {
    const { url } = reqObj;
    const shortUrl = this.buildShortUrlCode({ length: 7 });

    const longUrlObj: ILongUrlObj = {
      id: v4(),
      url,
      created_at: moment().format(),
    };

    await this.insertLongUrlQuery(longUrlObj);

    const shortUrlObj: IShortUrlObj = {
      id: v4(),
      short_url_code: shortUrl,
      long_url_id: longUrlObj.id,
      created_at: moment().format(),
    };

    const isUpdatedSuccessful = await this.insertShortUrlQuery(shortUrlObj);

    if (!isUpdatedSuccessful) {
      const retryShortUrl = await this.handleDuplicateShortUrlCode();
      Object.assign(shortUrlObj, { short_url_code: retryShortUrl });
      await this.insertShortUrlQuery(shortUrlObj);
    }

    const finalUrl = await this.buildShortUrl(shortUrlObj.short_url_code);
    return finalUrl;
  };

  public urlRedirectService = async (redirectObj: IUrlRedirectReqObj) => {
    const { short_url, ip_address, user_agent } = redirectObj;

    const shortUrlObj = await this.fetchLongUrlByShortUrlCode(short_url);

    if (!shortUrlObj.length) {
      throw new ErrorHandler({
        status_code: 404,
        message: "Short URL not found",
      });
    }

    const { short_url_id, long_url } = shortUrlObj[0];
    const countryCode = await this.fetchCountryCode(ip_address);
    const sanitizedIpAddress = this.sanitizeIp(ip_address);
    const browserDetails = this.fetchBrowserDetails(user_agent);

    const clickTrackingObj: IClickTrackingObj = {
      id: v4(),
      short_url_id: short_url_id,
      ip_address: sanitizedIpAddress,
      country_code: countryCode,
      browser_details: {
        ...browserDetails,
      },
      click_time: moment().format(),
    };

    producer.addTask({
      type: QueueMessageType.CLICK_TRACKING,
      payload: clickTrackingObj,
    });
    producer.addTask({
      type: QueueMessageType.CLICK_COUNT,
      payload: short_url_id,
    });

    return {
      id: clickTrackingObj.id,
      long_url,
    };
  };
}
