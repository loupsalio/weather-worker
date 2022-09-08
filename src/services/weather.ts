import axios, { AxiosError } from 'axios';
import MsgApiInterface from '../Interfaces/IMsgApi';
import DataboxInterface from '../Interfaces/IDataBox';

export default async function getWeather(city: string): Promise<DataboxInterface> {
    const result: DataboxInterface = { status: 0, data: null };

    try {
        const r = await axios(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHERMAP_API_KEY}`,
        );
        result.data = r.data?.weather[0]?.main;
    } catch (error) {
        const err = error as AxiosError;

        if (err.response && err.response.status === 400) {
            result.status = 1;
        } else if (
            err.response &&
            err.response.status === 404 &&
            (err.response.data as MsgApiInterface).message === 'city not found'
        ) {
            result.status = 2;
        } else throw new Error(err.message);
    }
    return result;
}
