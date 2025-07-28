import axios from 'axios';
import { baseurl } from './Variable';

const Axios = axios.create({baseURL:baseurl});
export default Axios; 