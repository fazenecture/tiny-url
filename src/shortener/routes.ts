import { Router } from "express";
import ShortenerController from "./controller";
import { validateUrlRedirect, validateUrlShortener } from "./middleware";
import { rateLimiter } from "./limiter";

const router = Router();

const { urlShortenerController, urlRedirectController } =
  new ShortenerController();

/**
 * @route POST /api/shorten
 * @desc Accepts a long URL and returns a shortened URL
 *
 *
 * @route GET /api/:short_url
 * @desc Redirects to the original URL
 */

router.use(rateLimiter);

router.post("/shorten", validateUrlShortener, urlShortenerController);
router.get("/:short_url", validateUrlRedirect, urlRedirectController);

export default router;
