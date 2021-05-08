import { IDistricts } from './../model/districts.interface';
import { IVaccineCentre } from '../model/vaccine-centre.interface';
import { CowinService } from './../service/cowin.service';

const STATE_CODE = 12; // 9 Delhi 12 Haryana
const DISTRICT_ID = 143;
const START_DATE = new Date();
const MIN_AGE = 18;

let districtList: IDistricts[] = [];

const prepareCentreList = async () => {
    try {
        const allCentreData = await Promise.all(districtList.map((district) => CowinService.getCentreList(district.district_id, START_DATE)));
        const allCentreList: IVaccineCentre[] = allCentreData.reduce((current, value) => current.concat(value), []);
        console.log(allCentreList.length);
        const availableCentreList: IVaccineCentre[] = allCentreList.map((centre) => {
            const availableSessionList = centre.sessions.filter((session) => session.available_capacity > 0 && session.min_age_limit <= MIN_AGE);
            return {
                ...centre,
                sessions: availableSessionList
            }
        }).filter(({ sessions }) => sessions.length > 0);
        console.log('Available Centre', availableCentreList.length);
        console.log('Available centre data', availableCentreList.map((centre) => ({
            center_id: centre.center_id,
            district_name: centre.district_name,
            block_name: centre.block_name,
            address: centre.address,
            fee_type: centre.fee_type,
            session: centre.sessions.map(({ date, vaccine, available_capacity }) => ({ date, vaccine, available_capacity }))
        })))
    } catch (error) {
        console.log(error)
    }
}

const prepareDistrictList = async () => {
    districtList = await CowinService.getDistrictList(STATE_CODE);
}

const tracker = async () => {
    await prepareDistrictList();
    await prepareCentreList();
}

export default tracker;