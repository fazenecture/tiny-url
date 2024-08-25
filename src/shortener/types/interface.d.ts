import { QueueMessageType } from "./enum";

export type IUrlShortenerReqObj = {
  url: string;
};

export type IBuildShortUrl = {
  length: number;
};

export type ILongUrlObj = {
  id: string;
  url: string;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type IShortUrlObj = {
  id: string;
  short_url_code: string;
  long_url_id: string;
  click_count?: number;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type IUrlRedirectReqObj = {
  short_url: string;
  ip_address: string;
  user_agent: any;
};

export type IClickTrackingObj = {
  id: string;
  short_url_id: string;
  ip_address: string;
  click_time?: string;
  country_code: string;
  browser_details: any;

  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
};

export type ITrackingDataObj = {
  id: string;
  long_url: string;
};

export type ILongUrlByShortUrlCode = {
  long_url: string;
  short_url_id: string;
};

export type IQueueMessageBody<
  T = string | IClickTrackingObj | IClickTrackingObj[] | string[]
> = {
  type: QueueMessageType;
  payload: T;
};
