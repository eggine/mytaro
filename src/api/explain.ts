import axios from 'axios';

const baseUrl = import.meta.env.VITE_SERVER_BASEURL
export const getExplain = (data: any) => {
  return axios({
    url: baseUrl + '/ask',
    method: 'POST',
    data
  })
}