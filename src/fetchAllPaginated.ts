import axios from 'axios';
import { API_BASE } from './config';

export async function fetchAllPaginated<T>(endpoint: string): Promise<T[]> {
    // Fetch all paginated data from the given endpoint
    // and return the results as an array of generic type T.
  let results: T[] = [];
  let url = `${endpoint}`;

  while (url) {
    const res = await axios.get(`${API_BASE}${url}`);
    const data = res.data;
    results = [...results, ...(data.results || data)];
    url = data.next ? data.next.replace('https://burgirs.2.rahtiapp.fi', '') : '';
  }

  return results;
}
