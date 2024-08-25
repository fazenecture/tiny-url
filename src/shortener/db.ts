import {
  IClickTrackingObj,
  ILongUrlByShortUrlCode,
  ILongUrlObj,
  IShortUrlObj,
} from "./types/interface";
import { db } from "../config/mysql";
import { ResultSetHeader } from "mysql2/promise";

export default class ShortenerDb {
  protected insertLongUrlQuery = async (longUrlObj: ILongUrlObj) => {
    const { id, url } = longUrlObj;

    const query = `INSERT INTO long_urls (id, url) VALUES (?, ?)`;
    const values = [id, url];
    return db.query(query, values);
  };

  protected insertShortUrlQuery = async (shortUrlObj: IShortUrlObj) => {
    const { id, short_url_code, long_url_id } = shortUrlObj;

    const query = `INSERT IGNORE INTO short_urls (id, short_url_code, long_url_id) VALUES (?, ?, ?)`;
    const values = [id, short_url_code, long_url_id];
    const [result] = await db.query<ResultSetHeader>(query, values);
    return result.affectedRows;
  };

  protected fetchShortUrlQuery = async (shortUrlCode: string) => {
    // short_url_code is an unique and indexed column

    const query = `SELECT * FROM short_urls WHERE short_url_code = ?`;
    const values = [shortUrlCode];
    const [result] = await db.query(query, values);
    return result as IShortUrlObj[];
  };

  protected insertClickTrackingQuery = async (
    clickTrackingObj: IClickTrackingObj
  ) => {
    const { id, short_url_id, ip_address, country_code, browser_details } =
      clickTrackingObj;

    const query = `INSERT INTO click_tracking (id, short_url_id, ip_address, country_code, browser_details) VALUES (?, ?, ?, ?, ?)`;
    const values = [
      id,
      short_url_id,
      ip_address,
      country_code,
      JSON.stringify(browser_details),
    ];
    return db.query(query, values);
  };

  protected updateShortUrlClickCountQuery = async (shortUrlId: string) => {
    const query = `UPDATE short_urls SET click_count = click_count + 1 WHERE id = ?`;
    const values = [shortUrlId];
    return db.query(query, values);
  };

  public fetchLongUrlByShortUrlCode = async (shortUrlCode: string) => {
    const query = `SELECT 
                    long_urls.url as long_url,
                    short_urls.id as short_url_id
                  FROM 
                    short_urls
                  INNER JOIN 
                    long_urls ON 
                    short_urls.long_url_id = long_urls.id
                  WHERE 
                    short_urls.short_url_code = ? 
                    AND short_urls.deleted_at IS NULL 
                    AND long_urls.deleted_at IS NULL`;

    const values = [shortUrlCode];
    const [result] = await db.query(query, values);
    return result as ILongUrlByShortUrlCode[];
  };

  public bulkInsertClickTrackingQuery = async (
    clickTrackingObj: IClickTrackingObj[]
  ) => {
    const query = `INSERT INTO click_tracking (id, short_url_id, ip_address, country_code, browser_details) VALUES ?`;
    const values = clickTrackingObj.map((obj) => [
      obj.id,
      obj.short_url_id,
      obj.ip_address,
      obj.country_code,
      JSON.stringify(obj.browser_details),
    ]);
    return db.query(query, [values]);
  };

  public bulkUpdateShortUrlClickCountQuery = async (shortUrlId: string[]) => {
    const query = `UPDATE short_urls SET click_count = click_count + 1 WHERE id IN (?)`;
    return db.query(query, [shortUrlId]);
  };
}
