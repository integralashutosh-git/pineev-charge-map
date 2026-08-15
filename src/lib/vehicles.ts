export interface Vehicle {
  id: string;
  make: string;
  model: string;
  batteryKwh: number;
  connector: string;
}

export const VEHICLES: Vehicle[] = [
  { id: "nexon", make: "Tata", model: "Nexon EV", batteryKwh: 40.5, connector: "CCS2" },
  { id: "tiago", make: "Tata", model: "Tiago EV", batteryKwh: 24, connector: "CCS2" },
  { id: "windsor", make: "MG", model: "Windsor EV", batteryKwh: 38, connector: "CCS2" },
  { id: "e2o", make: "Mahindra", model: "XUV400", batteryKwh: 39.4, connector: "CCS2" },
  { id: "ather", make: "Ather", model: "450X", batteryKwh: 3.7, connector: "Type 2" },
];
