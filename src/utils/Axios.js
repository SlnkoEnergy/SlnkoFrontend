import axios from 'axios';
import { baseurl } from './Variable';

const Axios = axios.create({baseURL:baseurl, withCredentials: true});
export default Axios; 