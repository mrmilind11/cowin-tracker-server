import { forkJoin, Observable, of } from 'rxjs';
import { IDistricts } from './../model/districts.interface';
import { IVaccineCentre } from '../model/vaccine-centre.interface';
import { CowinService } from './../service/cowin.service';
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
            const districtWiseCenter$ = districts.map((district) => CowinService.getCentreList(district.district_id, START_DATE));
            return forkJoin(districtWiseCenter$);
        }), map((response) => {
            const allCentreList = response.reduce((current, value) => current.concat(value), []);
            centreList = allCentreList.map((centre) => {
                const availableSessionList = centre.sessions.filter((session) => session.available_capacity > 0);
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
    checkClientSize();
    clientEventListener();
}

export default tracker;