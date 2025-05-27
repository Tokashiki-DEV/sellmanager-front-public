// lib/fetcher.ts
import API from './api';

const fetcher = (url: string) => API.get(url).then(res => res.data);

export default fetcher;