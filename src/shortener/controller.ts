import { trackingSnippetHTML } from "../views/tracking";
import customErrorHandler from "../utils/custom.error.handler";
import ShortenerService from "./service";
import { Request, Response } from "express";

export default class ShortenerController extends ShortenerService {
  /**
   * @description Controller for URL shortener
   */
  public urlShortenerController = async (req: Request, res: Response) => {
    try {
      const { url } = req.body;

      const data = await this.urlShortenerService({
        url,
      });

      res.status(200).json({
        success: true,
        message: "Shortened URL generated successfully",
        data,
      });
    } catch (error) {
      customErrorHandler(res, error);
    }
  };

  /**
   * @description Controller for URL redirect
   */
  public urlRedirectController = async (req: Request, res: Response) => {
    try {
      const { short_url } = req.params,
        { ip, headers } = req;

      const data = await this.urlRedirectService({
        short_url,
        ip_address: ip?.length ? ip : "",
        user_agent: headers["user-agent"],
      });

      res.redirect(data.long_url);
    } catch (error) {
      customErrorHandler(res, error);
    }
  };
}
