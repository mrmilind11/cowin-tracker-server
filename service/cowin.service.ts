import { IDistricts } from './../model/districts.interface';
import moment from "moment";
import fetch from "node-fetch";
import { IVaccineCentre } from "../model/vaccine-centre.interface";
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const CAL_BY_DIST_URL = 'https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict';
const DIST_BY_STATE_URL = 'https://cdn-api.co-vin.in/api/v2/admin/location/districts';

export class CowinService {
    public static getCentreList = (district: number, date: Date): Observable<IVaccineCentre[]> => {
        const params = new URLSearchParams();
        params.set('district_id', district.toString());
        params.set('date', moment(date).format('DD-MM-YYYY'));
        const apiUrl = `${CAL_BY_DIST_URL}?${params.toString()}`;

        return new Observable<ICentreListResponse>((observer) => {
            fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                .then((res) => res.json())
                .then((res) => observer.next(res))
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
            return (() => { })
        }).pipe(map((response) => response.centers))

    }

    public static getDistrictList = (stateCode: number): Observable<IDistricts[]> => {
        const apiUrl = `${DIST_BY_STATE_URL}/${stateCode}`;
        return new Observable<IDistrictResponse>((observer) => {
            fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
                .then((res) => res.json())
                .then((res) => observer.next(res))
                .catch((error) => observer.error(error))
                .finally(() => observer.complete());
            return (() => { })
        }).pipe(map((response) => response.districts))
    }
}

const delhiDistricts = [{ "district_id": 141, "district_name": "Central Delhi" }, { "district_id": 145, "district_name": "East Delhi" }, { "district_id": 140, "district_name": "New Delhi" }, { "district_id": 146, "district_name": "North Delhi" }, { "district_id": 147, "district_name": "North East Delhi" }, { "district_id": 143, "district_name": "North West Delhi" }, { "district_id": 148, "district_name": "Shahdara" }, { "district_id": 149, "district_name": "South Delhi" }, { "district_id": 144, "district_name": "South East Delhi" }, { "district_id": 150, "district_name": "South West Delhi" }, { "district_id": 142, "district_name": "West Delhi" }]
interface ICentreListResponse {
    centers: IVaccineCentre[];
}

interface IDistrictResponse {
    districts: IDistricts[]
}