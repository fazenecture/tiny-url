import { Worker } from "worker_threads";
import path from "path";

/**
 * ConsumerService class to process the queue
 * @param queue
 * @param batchInterval
 * @returns
 * @constructor
 */

export default class ConsumerService {
  queue: any;
  batchInterval: number;
  worker: Worker;
  isProcessing: boolean;
  retryQueue: any;

  constructor(queue: any, batchInterval: number) {
    {
      this.queue = queue;
      this.batchInterval = batchInterval;
      this.retryQueue = [];
      this.worker = new Worker(path.resolve(__dirname, "./batch.worker.ts"), {
        execArgv: ["--require", "ts-node/register"],
      });
      this.isProcessing = false;

      this.worker.on("message", (message) => {
        if (message.success) {
          console.log(
            `✅ Worker processed successfully for type: ${message.type} at ${message.message}`
          );
        } else {
          console.log(
            `❌ Worker failed to process for type: ${message.type} at ${message.message}`
          );
          this.addToRetryQueue({
            type: message.type,
            payload: message.payload,
          });
        }
      });

      this.worker.on("error", (error) => {
        console.error("Worker error: ", error);
      });

      this.worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
        }
      });

      this.startQueue();
    }
  }

  startQueue = () => {
    setInterval(() => {
      this.processQueue();
    }, this.batchInterval);
  };

  public processQueue = () => {
    if (this.isProcessing) {
      console.log("🟡 Queue is already processing");
      return;
    }

    if (this.queue.length === 0) {
      console.log("🫙 Queue is empty");
      return;
    }

    this.isProcessing = true;

    const tasksByType = this.queue.reduce((acc: any, task: any) => {
      if (!acc[task.type]) acc[task.type] = [];
      acc[task.type].push(task.payload);
      return acc;
    }, {});

    this.queue.length = 0;

    for (const [type, batch] of Object.entries(tasksByType)) {
      this.worker.postMessage({ type, payload: batch });
    }

    this.isProcessing = false;
  };

  public processRetryQueue = () => {
    if (this.retryQueue.length === 0) {
      return;
    }
    this.queue.push(...this.retryQueue);
    this.retryQueue.length = 0;
  };

  public addToRetryQueue = (task: any) => {
    console.log("🔁 Adding to retry queue");
    this.retryQueue.push(task);
  };
}
