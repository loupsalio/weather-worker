import { ZBClient, ZBWorkerTaskHandler } from 'zeebe-node';
import dotenv from 'dotenv';
import logger from '../plugins/logger';
import getWeather from './weather';

const { ZEEBE_GATEWAY = 'localhost:26500', TASK_NAME = 'weather-task' } = process.env;

const zbc = new ZBClient(ZEEBE_GATEWAY);

const handleTask: ZBWorkerTaskHandler = async (job) => {
    dotenv.config();
    try {
        logger.info(`Processing task ${TASK_NAME}`);
        const weather = await getWeather(job.variables.city);
        if (weather.status === 1 || weather.status === 2)
            return job.error('error-city-not-found', `City "${job.variables.city}" not found.`);
        return job.complete({ weather: weather.data });
    } catch (error) {
        logger.error(error);
        return job.error('error-general', `Error on processing task ${TASK_NAME}`);
    }
};

const startWorker = (): void => {
    try {
        zbc.createWorker({
            taskType: TASK_NAME,
            taskHandler: handleTask,
            onReady: () => logger.info(`Worker connected`),
            onConnectionError: () => logger.warn(`Worker disconnected`),
        });
    } catch (error) {
        logger.error(error);
    }
};

export default startWorker;
