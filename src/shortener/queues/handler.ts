import { parentPort } from "worker_threads";
import moment from "moment";
import { QueueMessageType } from "../types/enum";
import ShortenerDb from "../db";
import { IClickTrackingObj, IQueueMessageBody } from "../types/interface";

/**
 * Using IN_MEMORY_QUEUE as a queue to store the data
 * and process it in batches
 * @param queue
 * @returns
 * @constructor
 */
export default class WorkerHandler {
  shortenerDb: ShortenerDb;
  chunkSize: number;

  constructor() {
    this.init();
    this.shortenerDb = new ShortenerDb();
    this.chunkSize = 100;
  }

  init = () => {
    try {
      parentPort?.on("message", async (message: IQueueMessageBody) => {
        const { type, payload } = message;
        try {
          if (type === QueueMessageType.CLICK_COUNT) {
            await this.batchProcessClickCount(payload as string[]);
          } else if (type === QueueMessageType.CLICK_TRACKING) {
            await this.batchProcessClickTracking(
              payload as IClickTrackingObj[]
            );
          }

          parentPort?.postMessage({
            success: true,
            type,
            message: `Message processed successfully for type: ${type} at ${moment().format()}`,
          });
        } catch (error) {
          console.error("❌ Error in WorkerHandler: ", error);
          parentPort?.postMessage({
            success: false,
            type,
            payload,
            message: `Error in WorkerHandler: ${error}`,
          });
        }
      });
    } catch (error) {
      console.error("❌ Error in WorkerHandler: ", error);
    }
  };

  public batchProcessClickTracking = async (batch: IClickTrackingObj[]) => {
    try {
      if (!batch?.length) {
        return;
      }

      for (let i = 0; i < batch.length; i += this.chunkSize) {
        const chunk = batch.slice(i, i + this.chunkSize);
        await this.shortenerDb.bulkInsertClickTrackingQuery(chunk);
      }
    } catch (error) {
      console.error("❌ Error in batchProcessClickTracking: ", error);
    }
  };

  public batchProcessClickCount = async (batch: string[]) => {
    try {
      if (!batch?.length) {
        return;
      }

      for (let i = 0; i < batch.length; i += this.chunkSize) {
        const chunk = batch.slice(i, i + this.chunkSize);
        await this.shortenerDb.bulkUpdateShortUrlClickCountQuery(chunk);
      }
    } catch (error) {
      console.error("❌ Error in batchProcessClickCount: ", error);
    }
  };
}
