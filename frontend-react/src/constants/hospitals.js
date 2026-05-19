// src/constants/hospitals.js
export const RATNAGIRI_HOSPITALS = [
  { id:'RH01', name:'District General Hospital', type:'Government', icu:true,  totalBeds:300, usedBeds:0 },
  { id:'RH02', name:'Civil Hospital Ratnagiri',  type:'Government', icu:true,  totalBeds:200, usedBeds:0 },
  { id:'RH03', name:'Cancer Foundation Hospital', type:'Speciality', icu:false, totalBeds:100, usedBeds:0 },
  { id:'RH04', name:'Tilak Ayurvedic Hospital',   type:'Private',   icu:false, totalBeds:50,  usedBeds:0 },
  { id:'RH05', name:'Pawas Rural Hospital',        type:'Rural',     icu:false, totalBeds:30,  usedBeds:0 },
];

export const TOTAL_BEDS = RATNAGIRI_HOSPITALS.reduce((s, h) => s + h.totalBeds, 0); // 680
