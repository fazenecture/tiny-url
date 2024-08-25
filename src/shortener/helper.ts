import { IBuildShortUrl } from "./types/interface";
import ShortenerDb from "./db";
import crypto from "crypto";
import ErrorHandler from "../utils/error.handler";
import geoip from "geoip-lite";
import useragent from "useragent";

export default class ShortenerHelper extends ShortenerDb {
  protected buildShortUrlCode = (shortenObj: IBuildShortUrl): string => {
    const { length } = shortenObj;
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let shortUrl = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charactersLength);
      shortUrl += characters[randomIndex];
    }

    return shortUrl;
  };

  protected handleDuplicateShortUrlCode = async () => {
    const maxAttempt = parseInt(process.env.MAX_DUPLICATE_ATTEMPT ?? "5");
    let attempt = 0;
    let shortUrl = "";
    while (attempt < maxAttempt) {
      shortUrl = this.buildShortUrlCode({ length: 7 });
      const shortUrlObj = await this.fetchShortUrlQuery(shortUrl);
      if (shortUrlObj?.length === 0) {
        break;
      }
      attempt++;
    }

    if (attempt === maxAttempt) {
      throw new ErrorHandler({
        status_code: 500,
        message: "Failed to generate unique short url",
      });
    }

    return shortUrl;
  };

  protected buildShortUrl = async (code: string) => {
    const domain = process.env.DOMAIN;

    if (!domain?.length) {
      throw new ErrorHandler({
        status_code: 500,
        message: "Domain is not defined!",
      });
    }

    const sanitizedDomain = this.sanitizeDomainUrl(domain);
    return `${sanitizedDomain}/${code}`;
  };

  protected sanitizeDomainUrl = (domain: string) => {
    if (!domain.length) {
      return;
    }

    if (domain.endsWith("/")) {
      return domain.slice(0, -1);
    }

    return domain;
  };

  protected fetchCountryCode = async (ip: string) => {
    const geo = geoip.lookup(ip);
    console.log("geo: ", geo);
    return geo?.country ?? "";
  };

  protected sanitizeIp = (ip: string) => {
    if (ip === "::1") {
      return "127.0.0.1";
    }

    return ip;
  };

  protected fetchBrowserDetails = (userAgent: any) => {
    const agent = useragent.parse(userAgent);
    const browserName = agent.family;
    const browserVersion = agent.toVersion();

    return {
      name: browserName,
      version: browserVersion,
      user_agent: userAgent,
    };
  };
}
