import { IDistricts } from './../model/districts.interface';
import moment from "moment";
import fetch from "node-fetch";
import { IVaccineCentre } from "../model/vaccine-centre.interface";

const CAL_BY_DIST_URL = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict';
const DIST_BY_STATE_URL = 'https://cdn-api.co-vin.in/api/v2/admin/location/districts';

export class CowinService {
    public static async getCentreList(district: number, date: Date): Promise<IVaccineCentre[]> {
        const params = new URLSearchParams();
        params.set('district_id', district.toString());
        params.set('date', moment(date).format('DD-MM-YYYY'));
        const apiUrl = `${CAL_BY_DIST_URL}?${params.toString()}`;
        console.log(apiUrl);
        try {
            const response = await fetch(`${CAL_BY_DIST_URL}?${params.toString()}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const responseJson: ICentreListResponse = await response.json();
            return responseJson.centers || [];
        } catch (error) {
            console.log('Centre Load Error', error);
            return [];
        }
    }

    public static async getDistrictList(stateCode: number): Promise<IDistricts[]> {
        try {
            const response = await fetch(`${DIST_BY_STATE_URL}/${stateCode}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const responseJson: IDistrictResponse = await response.json();
            return responseJson.districts || [];
        } catch (error) {
            console.log('Error occured districts', error);
            return [];
            // return delhiDistricts;
        }
    }
}

const delhiDistricts = [{ "district_id": 141, "district_name": "Central Delhi" }, { "district_id": 145, "district_name": "East Delhi" }, { "district_id": 140, "district_name": "New Delhi" }, { "district_id": 146, "district_name": "North Delhi" }, { "district_id": 147, "district_name": "North East Delhi" }, { "district_id": 143, "district_name": "North West Delhi" }, { "district_id": 148, "district_name": "Shahdara" }, { "district_id": 149, "district_name": "South Delhi" }, { "district_id": 144, "district_name": "South East Delhi" }, { "district_id": 150, "district_name": "South West Delhi" }, { "district_id": 142, "district_name": "West Delhi" }]
interface ICentreListResponse {
    centers: IVaccineCentre[];
}

interface IDistrictResponse {
    districts: IDistricts[]
}