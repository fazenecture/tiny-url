import { queue } from "../..";
import { IQueueMessageBody } from "../types/interface";

/**
 * Producer class to add task to the queue
 * @param queue
 * @returns
 * @constructor
 */
export default class Producer {
  queue: IQueueMessageBody[];

  constructor(queue: IQueueMessageBody[]) {
    this.queue = queue;
  }

  addTask(task: IQueueMessageBody) {
    this.queue.push(task);
  }
}
