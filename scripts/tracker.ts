import fetch from 'node-fetch';

const tracker = () => {
    fetch('https://cdn-api.co-vin.in/api/v2/appointment/sessions/calendarByDistrict?district_id=143&date=08-05-2021',
        { headers: { 'User-Agent': 'Mozilla/5.0' } })
        .then((res) => res.text())
        .then((res) => {
            console.log(res);
        })
        .catch(() => {
            console.log('Error occured')
        })
}

export default tracker;