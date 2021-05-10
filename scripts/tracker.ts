import { forkJoin, Observable, of } from 'rxjs';
import { IDistricts } from './../model/districts.interface';
import { IVaccineCentre } from '../model/vaccine-centre.interface';
import { CowinService } from './../service/cowin.service';
import cron from 'node-cron';
import nodenotifier from 'node-notifier'
import { emitToSocket, onClientAdded, onClientRemoved } from './socket-server';
import { map, switchMap, take } from 'rxjs/operators';

const AVAIL_DETAIL = 'AVAIL_DETAIL';
const STATE_CODE = 9; // 9 Delhi 12 Haryana
const START_DATE = new Date();
const MIN_AGE = 18;

let districtList: IDistricts[];
let centreList: IVaccineCentre[] = [];

const clientSet = new Set();
let dataFetchInProgress = false;
let intervalRef: any;

// const prepareCentreList = async () => {
//     try {
//         const allCentreData = await Promise.all(districtList.map((district) => CowinService.getCentreList(district.district_id, START_DATE)));
//         const allCentreList: IVaccineCentre[] = allCentreData.reduce((current, value) => current.concat(value), []);
//         console.log(allCentreList.length);
//         const availableCentreList: IVaccineCentre[] = allCentreList.map((centre) => {
//             const availableSessionList = centre.sessions.filter((session) => session.available_capacity > 0 && session.min_age_limit <= MIN_AGE);
//             return {
//                 ...centre,
//                 sessions: availableSessionList
//             }
//         }).filter(({ sessions }) => sessions.length > 0);
//         console.log('Available Centre', availableCentreList.length);
//         // console.log('Available centre data', availableCentreList.map((centre) => ({
//         //     center_id: centre.center_id,
//         //     district_name: centre.district_name,
//         //     block_name: centre.block_name,
//         //     address: centre.address,
//         //     fee_type: centre.fee_type,
//         //     pincode: centre.pincode,
//         //     session: centre.sessions.map(({ date, vaccine, available_capacity }) => ({ date, vaccine, available_capacity }))
//         // })));
//         // if (availableCentreList.length > 0) {
//         //     availableCentreList.forEach((centre) => {
//         //         const availableDetail = centre.sessions.reduce((current, value) => {
//         //             return current + value.date + ' ' + value.available_capacity + '\n';
//         //         }, '')
//         //         nodenotifier.notify({
//         //             title: centre.district_name + ' ' + centre.address,
//         //             message: availableDetail,
//         //             wait: false
//         //         })
//         //     })
//         // }
//         emitToSocket(AVAIL_DETAIL, availableCentreList);
//     } catch (error) {
//         console.log(error)
//     }
// }

const getDistrictList = (): Observable<IDistricts[]> => {
    if (districtList) {
        return of(districtList);
    }
    return CowinService.getDistrictList(STATE_CODE)
        .pipe(map((response) => {
            districtList = [...response, { district_id: 188, district_name: 'Gurgaon' }];
            return districtList;
        }))
}

const fetchCentreList = () => {
    if (dataFetchInProgress) {
        return;
    }
    dataFetchInProgress = true;
    const call$: Observable<IVaccineCentre[]> = getDistrictList()
        .pipe(switchMap((districts) => {
            const districtWiseCenter$ = districtList.map((district) => CowinService.getCentreList(district.district_id, START_DATE));
            return forkJoin(districtWiseCenter$);
        }), map((response) => {
            const allCentreList = response.reduce((current, value) => current.concat(value), []);
            centreList = allCentreList.map((centre) => {
                const availableSessionList = centre.sessions.filter((session) => session.available_capacity > 0 && session.min_age_limit <= MIN_AGE);
                return {
                    ...centre,
                    sessions: availableSessionList
                }
            }).filter(({ sessions }) => sessions.length > 0);
            console.log('Available Centre', centreList.length);
            return centreList;
        }))
    call$.pipe(take(1)).subscribe((response) => {
        emitToSocket(AVAIL_DETAIL, response);
        dataFetchInProgress = false;
    }, (error) => {
        dataFetchInProgress = false;
        console.log('Error', error)
    })
}

const setCron = () => {
    fetchCentreList();
    intervalRef = setInterval(() => {
        fetchCentreList();
    }, 10000)
}

const checkClientSize = () => {
    if (clientSet.size > 0 && !intervalRef) {
        setCron();
    } else if (clientSet.size === 0 && intervalRef) {
        clearInterval(intervalRef);
        intervalRef = 0;
    } else {
        return;
    }
}

const clientEventListener = () => {
    onClientAdded()
        .subscribe((id) => {
            clientSet.add(id);
            emitToSocket('CONNECTED', { id })
            emitToSocket(AVAIL_DETAIL, centreList, id);
            console.log('Client set', clientSet);
            checkClientSize();
        }, (error) => {
            console.log('Error', error);
        })

    onClientRemoved()
        .subscribe((id) => {
            clientSet.delete(id);
            console.log('Client set', clientSet);
            checkClientSize();
        }, (error) => {
            console.log('Error', error);
        })
}

const tracker = () => {
    // cron.schedule('*/15 * * * * *', async () => {
    //     await prepareCentreList();
    // });
    // task.stop();
    checkClientSize();
    clientEventListener();
}

export default tracker;