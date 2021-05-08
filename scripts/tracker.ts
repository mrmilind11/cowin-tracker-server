import { IDistricts } from './../model/districts.interface';
import { IVaccineCentre } from '../model/vaccine-centre.interface';
import { CowinService } from './../service/cowin.service';
import cron from 'node-cron';
import nodenotifier from 'node-notifier'
const STATE_CODE = 9; // 9 Delhi 12 Haryana
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
            pincode: centre.pincode,
            session: centre.sessions.map(({ date, vaccine, available_capacity }) => ({ date, vaccine, available_capacity }))
        })));
        if (availableCentreList.length > 0) {
            availableCentreList.forEach((centre) => {
                const availableDetail = centre.sessions.reduce((current, value) => {
                    return current + value.date + ' ' + value.available_capacity + '\n';
                }, '')
                nodenotifier.notify({
                    title: centre.district_name + ' ' + centre.address,
                    message: availableDetail,
                    wait: false
                })
            })
        }
    } catch (error) {
        console.log(error)
    }
}

const prepareDistrictList = async () => {
    districtList = await CowinService.getDistrictList(STATE_CODE);
    districtList.push({ district_id: 188, district_name: 'Gurgaon' })
}
const tracker = async () => {
    await prepareDistrictList();
    cron.schedule('*/30 * * * * *', async () => {
        await prepareCentreList();
    })
}

export default tracker;