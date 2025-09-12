import axios from "../services/axios";
import apiUrl from "../constant/apiUrl";

const workingHoursApi = {
  get: () => axios.get(apiUrl.working_hours.index),
  update: (data: any) => axios.put(apiUrl.working_hours.index, data),
};

export default workingHoursApi;
